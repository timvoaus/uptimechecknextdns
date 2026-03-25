import { MaintenanceConfig, PageConfig, WorkerConfig } from './types/config'

const pageConfig: PageConfig = {
  // Title for your status page
  title: "NextDNS Status Page",
  // Links shown at the header of your status page, could set `highlight` to `true`
  links: [
    // { link: 'mailto:timvo@90s.one', label: 'Email Me', highlight: true },
  ],
  group: {
    '🌐 NextDNS': ['45_90_28_0', '45_90_30_0', 'viettel_han', 'viettel_sgn', 'lightnode_han', 'lightnode_sgn'],
    '🌐 Others': ['opendns', 'quad9', 'cloudfare', 'adguard'],
  },  
}

const workerConfig: WorkerConfig = {
  monitors: [
    { 
      id: '45_90_28_0', 
      name: 'NextDNS AnyCast - 45.90.28.0', 
      method: 'TCP_PING', 
      target: '45.90.28.0:53',
      checkProxy: 'worker://apac'
    }, 
    { 
      id: '45_90_30_0', 
      name: 'NextDNS AnyCast - 45.90.30.0', 
      method: 'TCP_PING', 
      target: '45.90.30.0:53', 
      checkProxy: 'worker://oc'
    }, 
    { 
      id: 'viettel_han', 
      name: 'NextDNS Ultralow - Viettel Hanoi', 
      method: 'GET', 
      target: 'https://viettel-han-1.edge.nextdns.io/resolve?name=dns.nextdns.io', 
      checkProxy: 'worker://oc'
    }, 
    { 
      id: 'viettel_sgn', 
      name: 'NextDNS Ultralow - Viettel Saigon', 
      method: 'GET', 
      target: 'https://viettel-sgn-1.edge.nextdns.io/resolve?name=dns.nextdns.io', 
      checkProxy: 'worker://oc'
    }, 
    { 
      id: 'lightnode_han', 
      name: 'NextDNS Ultralow - Ligthnode Hanoi', 
      method: 'GET', 
      target: 'https://lightnode-han-1.edge.nextdns.io/resolve?name=dns.nextdns.io',
      checkProxy: 'worker://oc'
    },      
    { 
      id: 'lightnode_sgn', 
      name: 'NextDNS Ultralow - Lightnode Saigon', 
      method: 'GET', 
      target: 'https://lightnode-sgn-1.edge.nextdns.io/resolve?name=dns.nextdns.io',
      checkProxy: 'worker://oc'
    },      
    { 
      id: 'opendns', 
      name: 'OpenDNS - 208.67.222.222', 
      method: 'TCP_PING', 
      target: '208.67.222.222:53',
      checkProxy: 'worker://oc'
    },      
    { 
      id: 'quad9', 
      name: 'Quad9 ECS - 9.9.9.11', 
      method: 'TCP_PING', 
      target: '9.9.9.11:53', 
      checkProxy: 'worker://oc'
    },  
    { id: 'cloudfare', 
     name: 'CloudFlare DNS - 1.1.1.1', 
     method: 'TCP_PING', 
     target: '1.1.1.1:53', 
     checkProxy: 'worker://oc'
    },
    { id: 'adguard', 
     name: 'Adguard Public DNS - 94.140.14.14', 
     method: 'TCP_PING', 
     target: '94.140.14.14:53', 
     checkProxy: 'worker://oc'
    },        
  ],
  // notification: {
  //   webhook: {
  //     url: 'https://api.telegram.org/bot8725031808:AAGxsdasda2XHmkZ_OwuXl-jrMk-gR54neWa4qxM/sendMessage',
  //     payloadType: 'param',
  //     payload: {
  //       chat_id: 7381939387,
  //       text: 'ONE OF YOUR SERVER IS DOWN',
  //     },
  //   },
  //   timeZone: 'Australia/Sydney',
  //   gracePeriod: 5,
  //   skipErrorChangeNotification: true,
  // },
  callbacks: {
    onStatusChange: async (env: any, monitor: any, isUp: boolean, timeIncidentStart: number, timeNow: number, reason: string) => {},
    onIncident: async (env: any, monitor: any, timeIncidentStart: number, timeNow: number, reason: string) => {},
  },  
}

const maintenances: MaintenanceConfig[] = []

export { maintenances, pageConfig, workerConfig }
