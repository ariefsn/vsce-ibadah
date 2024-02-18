// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import dayjs, { Dayjs } from 'dayjs';
import { scheduleJob } from 'node-schedule';
import * as vscode from 'vscode';
import { IMap, IPrayer, IPrayerByCalendarCityDto, ITimings } from './entities';
import { IbadahCommandKeys, IbadahConfigKeys, IbadahPrayTime, IbadahStoreKeys, config as _config, store as _store, http } from './helper';
import { Prayer } from './services';
dayjs.extend(require('dayjs/plugin/customParseFormat'));

const filteredPray = [IbadahPrayTime.Fajr, IbadahPrayTime.Dhuhr, IbadahPrayTime.Asr, IbadahPrayTime.Maghrib, IbadahPrayTime.Isha]

let prayStatusbarItem: vscode.StatusBarItem
let nextPrayTime: IbadahPrayTime | undefined

const init = async () => {
	const config = _config()
	const cfgLocation = {
		"country": config.get<string>(IbadahConfigKeys.LOCATION_COUNTRY) || "Indonesia",
		"city": config.get<string>(IbadahConfigKeys.LOCATION_CITY) || "Surabaya",
		"postalCode": config.get<string>(IbadahConfigKeys.LOCATION_POSTALCODE) || ""
	}
	const cfgPray = {
		"notification": {
			"before": config.get<number>(IbadahConfigKeys.PRAYER_NOTIFICATION_BEFORE) || 10,
			"message": config.get<string>(IbadahConfigKeys.PRAYER_NOTIFICATION_MESSAGE) || "It's time to pray {pray}"
		},
		"names": config.get<IMap>(IbadahConfigKeys.PRAYER_NAMES)
	}
	await Promise.all([
		config.set("location", cfgLocation),
		config.set("pray", cfgPray)
	])
	prayStatusbarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, -100)
	prayStatusbarItem.text = "Loading"
	vscode.window.showInformationMessage("Ibadah extension is now active! You can customize configurations in the settings :)")
}

export async function activate(context: vscode.ExtensionContext) {
	const _http = http()
	const prayerService = new Prayer(_http)
	const store = _store(context)
	store.sync([IbadahStoreKeys.PRAYER_TIMES])

	await init()

	// Commands
	const PrayerConfigure = vscode.commands.registerCommand(IbadahCommandKeys.PRAYER_CONFIGURE, () => {
		vscode.commands.executeCommand('workbench.action.openSettingsJson', { revealSetting: { key: 'ibadah' } });
	});

	const PrayerRefresh = vscode.commands.registerCommand(IbadahCommandKeys.PRAYER_REFRESH, async () => {
		await onFetch(true)
	});

	context.subscriptions.push(PrayerConfigure, PrayerRefresh);

	const fetchPrayItems = async (payload: IPrayerByCalendarCityDto, force: boolean): Promise<IPrayer[]> => {
		let prayItems = store.get<IPrayer[]>(IbadahStoreKeys.PRAYER_TIMES) ?? []
		if (prayItems?.length < 1 || force) {
			console.log('[Ibadah] Fetching prayer times...')
			const res = await prayerService.getPrayerByAddress(payload)

			if (res?.code === 200 && res?.data) {
				store.set(IbadahStoreKeys.PRAYER_TIMES, res.data)
				prayItems = res.data
				return prayItems
			} else {
				vscode.window.showErrorMessage("Failed to fetch prayer time")
			}
		} else {
			const dates = prayItems.map(item => {
				return item.date.gregorian.date
			})

			const now = dayjs()

			if (!dates.includes(now.format('DD-MM-YYYY'))) {
				store.del(IbadahStoreKeys.PRAYER_TIMES)
				prayItems = await fetchPrayItems(payload, force)
			}
		}

		return prayItems
	}

	const onFetch = async (force: boolean = false) => {
		const config = _config()
		const cfg = {
			country: config.get<string>(IbadahConfigKeys.LOCATION_COUNTRY) ?? '',
			city: config.get<string>(IbadahConfigKeys.LOCATION_CITY) ?? '',
			postalCode: config.get<string>(IbadahConfigKeys.LOCATION_POSTALCODE) ?? '',
			beforeMinutes: config.get<number>(IbadahConfigKeys.PRAYER_NOTIFICATION_BEFORE) ?? 15,
			message: config.get<string>(IbadahConfigKeys.PRAYER_NOTIFICATION_MESSAGE) ?? `It's time to pray {pray}`,
		}
		if (!cfg.country || !cfg.city) {
			await store.del(IbadahStoreKeys.PRAYER_TIMES)
			prayStatusbarItem.text = `Ibadah`
			prayStatusbarItem.tooltip = `Invalid configurations`
			prayStatusbarItem.command = IbadahCommandKeys.PRAYER_CONFIGURE
			prayStatusbarItem.show()
			const action = await vscode.window.showInformationMessage('Please configure your location to enable prayer times.', ...['Configure'])
			switch (action) {
				case 'Configure':
					vscode.commands.executeCommand('workbench.action.openSettingsJson', { revealSetting: { key: 'ibadah' } });
					break;

				default:
					break;
			}
			return
		}

		const now = dayjs()
		const tomorrow = now.add(1, 'day')
		const prayItems = await fetchPrayItems({
			country: cfg.country,
			city: cfg.city,
			postalCode: cfg.postalCode,
			method: 2,
			month: now.month() + 1,
			year: now.year()
		}, force)

		const todayPray = prayItems.find(item => {
			return item.date.gregorian.date === now.format('DD-MM-YYYY')
		})

		const tomorrowPray = prayItems.find(item => {
			return item.date.gregorian.date === tomorrow.format('DD-MM-YYYY')
		})

		const added = now.add(cfg.beforeMinutes > 0 ? cfg.beforeMinutes : 0, 'minute')

		type TimingsKey = keyof ITimings;

		const orderedPray: { title: string, time: string, timestamp: Dayjs }[] = []
		const names = config.get<IMap>(IbadahConfigKeys.PRAYER_NAMES)
		let isNextPrayFoundForToday = false
		Object.keys(todayPray?.timings ?? {}).forEach((key) => {
			const el = todayPray?.timings[key as TimingsKey];
			if (el && filteredPray.includes(key as IbadahPrayTime)) {
				const timeOnly = el.split(' ')[0]
				const timestamp = dayjs(`${todayPray?.date.gregorian.date} ${timeOnly}`, 'DD-MM-YYYY HH:mm')

				if (timestamp.isAfter(now) && !isNextPrayFoundForToday) {
					isNextPrayFoundForToday = true
					nextPrayTime = key as IbadahPrayTime
					prayStatusbarItem.text = `${names?.[nextPrayTime] || nextPrayTime} (${timeOnly})`
					prayStatusbarItem.tooltip = `${cfg.country}, ${cfg.city}, ${todayPray?.date.gregorian.date}`
					prayStatusbarItem.show()
				}

				const customName = names?.[key]
				orderedPray.push({
					title: customName || key,
					time: todayPray?.timings[key as TimingsKey],
					timestamp
				})
			}
		})
		if (!isNextPrayFoundForToday) {
			nextPrayTime = IbadahPrayTime.Fajr
			prayStatusbarItem.text = `${names?.[nextPrayTime] || nextPrayTime} (${tomorrowPray?.timings[nextPrayTime].split(' ')[0]})`
			prayStatusbarItem.tooltip = `${cfg.country}, ${cfg.city}, ${tomorrowPray?.date.gregorian.date}`
			prayStatusbarItem.show()
		}
		orderedPray.sort((a, b) => a.time.localeCompare(b.time))

		orderedPray.forEach((el, index) => {
			const timeOnly = el.time.split(' ')[0]
			if (added.format('HH:mm') === timeOnly) {
				vscode.window.showInformationMessage(cfg.message.replace('{pray}', el.title))
			}
		})
	}

	// Initial Fetch
	onFetch()

	// Run the job each minute
	scheduleJob('* * * * *', async () => {
		onFetch()
	})
}

// This method is called when your extension is deactivated
export function deactivate() {
	prayStatusbarItem.dispose()
}
