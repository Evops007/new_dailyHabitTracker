export default function manifest() {
    return {
        name: 'Daglig Vane Tracker',
        short_name: 'Vaner',
        description: 'Spor dine daglige vaner enkelt.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3b82f6',
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
            {
                src: '/icon.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
                purpose: 'maskable'
            },
            {
                src: '/icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'maskable'
            }
        ],
    }
}
