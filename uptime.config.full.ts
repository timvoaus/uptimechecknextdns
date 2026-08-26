// import { MaintenanceConfig, PageConfig, WorkerConfig } from './types/config'

// const pageConfig: PageConfig = {
//   // Title for your status page
//   title: "Tim Cloud Apps Status Page",
//   // Links shown at the header of your status page, could set `highlight` to `true`
//   links: [
//     { link: 'mailto:timvo@90s.one', label: 'Email Me', highlight: true },
//   ],
// }

// const workerConfig: WorkerConfig = {
//   monitors: [
//     {
//       id: 'about_me',
//       name: 'About Me',
//       method: 'GET',
//       target: 'https://about.timvo.au/',
//       checkProxy: 'worker://oc'
//     },
//     {
//       id: 'agh_au',
//       name: 'Adguard Home AU',
//       method: 'GET',
//       target: 'https://au.pidns.org/',
//       checkProxy: 'worker://oc'
//     },
//     {
//       id: 'agh_vn',
//       name: 'Adguard Home VN',
//       method: 'GET',
//       target: 'https://vn.pidns.org/',
//       checkProxy: 'worker://apac'
//     },
//     {
//       id: 'wedding_web',
//       name: 'Wedding Website',
//       method: 'GET',
//       target: 'https://vannguyen.nhutvo.com/',
//       checkProxy: 'worker://wnam'
//     },
//     {
//       id: 'oci_syd',
//       name: 'Oracle SYD',
//       method: 'GET',
//       target: 'https://oraclevpn.timvo.net/',
//       checkProxy: 'worker://oc'
//     },
//     {
//       id: 'vhost',
//       name: 'vhost',
//       method: 'GET',
//       target: 'https://vhostvpn.90s.one/',
//       checkProxy: 'worker://apac'
//     },
//     {
//       id: 'pi4',
//       name: 'Raspberry Pi 4',
//       method: 'GET',
//       target: 'https://pidns.nhutvo.com/',
//       checkProxy: 'worker://oc'
//     },
//     { id: 'rock4',
//      name: 'Rock 4c Plus',
//      method: 'GET',
//      target: 'https://vannguyen.nhutvo.com/',
//      checkProxy: 'worker://oc'
//     },
//     {
//       id: 'dedirock',
//       name: 'Dedirock LA',
//       method: 'GET',
//       target: 'https://dedirockvpn.90s.one/',
//       checkProxy: 'worker://wnam'
//     },
//     { id: 'colocrossing',
//      name: 'ColoCrossing LA',
//      method: 'TCP_PING',
//      target: '23.95.29.254:51821',
//      checkProxy: 'worker://wnam'
//     },
//     { id: 'rabisuSYD',
//      name: 'Rabisu SYD',
//      method: 'TCP_PING',
//      target: '45.38.149.239:443',
//      checkProxy: 'worker://oc'
//     },
//   ],
//   notification: {
//     webhook: {
//       url: 'https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage',
//       payloadType: 'param',
//       payload: {
//         chat_id: '${TELEGRAM_CHAT_ID}',
//         text: '$MSG',
//       },
//     },
//     timeZone: 'Australia/Sydney',
//     gracePeriod: 5,
//     skipErrorChangeNotification: true,
//   },
//   callbacks: {
//     onStatusChange: async (env: any, monitor: any, isUp: boolean, timeIncidentStart: number, timeNow: number, reason: string) => {},
//     onIncident: async (env: any, monitor: any, timeIncidentStart: number, timeNow: number, reason: string) => {},
//   },
// }

// const maintenances: MaintenanceConfig[] = []

// export { maintenances, pageConfig, workerConfig }
