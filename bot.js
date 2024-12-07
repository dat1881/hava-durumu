import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';
import fs from 'fs';

// config.json dosyasını asenkron olarak okuma
const { discordToken, channelId } = JSON.parse(await fs.promises.readFile('./config.json', 'utf-8'));

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Türkiye şehirlerinin doğru bölgelere ayrılması
const regions = {
    "Marmara": [
        "İstanbul", "Tekirdağ", "Edirne", "Kocaeli", "Bursa", "Yalova", "Sakarya", "Çanakkale"
    ],
    "Ege": [
        "İzmir", "Manisa", "Aydın", "Muğla", "Denizli", "Uşak", "Kütahya", "Afyonkarahisar"
    ],
    "Akdeniz": [
        "Antalya", "Mersin", "Adana", "Hatay", "Osmaniye", "Kahramanmaraş", "Isparta", "Burdur"
    ],
    "Karadeniz": [
        "Trabzon", "Samsun", "Ordu", "Zonguldak", "Rize", "Giresun", "Artvin", "Sinop", "Kastamonu", "Amasya", "Tokat", "Gümüşhane"
    ],
    "İç Anadolu": [
        "Ankara", "Konya", "Eskişehir", "Kayseri", "Kırıkkale", "Aksaray", "Nevşehir", "Kırşehir", "Sivas", "Karaman"
    ],
    "Doğu Anadolu": [
        "Erzurum", "Van", "Erzincan", "Ağrı", "Bingöl", "Bitlis", "Muş", "Elazığ", "Malatya", "Hakkari", "Kars", "Iğdır"
    ],
    "Güneydoğu Anadolu": [
        "Gaziantep", "Şanlıurfa", "Diyarbakır", "Mardin", "Batman", "Siirt", "Şırnak", "Adıyaman", "Kilis", "Osmaniye"
    ]
};

// Hava durumu verilerini almak için fonksiyon
async function fetchWeather(city) {
    const url = `https://api.msidev.com.tr/hava-durumu?sehir=${encodeURIComponent(city)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log('API Yanıtı:', data);

        // API yanıtını işleme
        if (!data || !data.sehir) {
            console.error(`Hata: API'den geçerli bir yanıt alınamadı. Şehir: ${city}`);
            return null;
        }

        const cleanTemperature = parseFloat(data.sicaklik.replace(/[^\d.-]/g, ''));

        const forecast = data.tahmin.map(day => ({
            gun: day.gun,
            sicaklik: parseFloat(day.sicaklik.replace(/[^\d.-]/g, '')),
            ruzgar: day.ruzgar
        }));

        return {
            temperature: cleanTemperature,
            weather: data.durum,
            city: data.sehir,
            forecast: forecast
        };
    } catch (error) {
        console.error('Hata:', error);
        return null;
    }
}

// Hava durumu mesajını göndermek için fonksiyon
async function sendWeatherUpdate(regionMessage) {
    const channel = await client.channels.fetch(channelId);
    if (channel) {
        channel.send(regionMessage);
    } else {
        console.log('Kanal bulunamadı');
    }
}

// 24 saatlik aralıklarla bölgesel hava durumu mesajları gönderme
client.on('ready', () => {
    console.log('Bot is ready!');

    setInterval(async () => {
        for (const region in regions) {
            let regionMessage = `**${region} Bölgesi Hava Durumu**:\n\n`;
            for (const city of regions[region]) {
                const weatherData = await fetchWeather(city);
                if (weatherData) {
                    const { temperature, weather, city: cityName } = weatherData;
                    const currentDate = new Date().toLocaleString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    regionMessage += `**${cityName}:** ${temperature}°C, ${weather}\n`;
                } else {
                    regionMessage += `**${city}:** Hava durumu bilgisi alınamadı.\n`;
                }
            }
            regionMessage += '\n---------------------------------------\n'; // Bölge arasına çizgi ekle
            sendWeatherUpdate(regionMessage);
        }
    }, 24 * 60 * 60 * 1000);  // 24 saat
});

// Komutları dinlemek için event
client.on('messageCreate', async (message) => {
    // Eğer mesaj '!havadurumu <şehir>' ile başlıyorsa
    if (message.content.startsWith('!havadurumu')) {
        const args = message.content.split(' ');
        const cityName = args.slice(1).join(' ');

        if (!cityName) {
            return message.channel.send("Lütfen bir şehir adı girin.");
        }

        const weatherData = await fetchWeather(cityName);
        if (weatherData) {
            const { temperature, weather, city, forecast } = weatherData;
            const currentDate = new Date().toLocaleString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            let forecastMessage = `**${city} Hava Durumu (Bugün):**\n`;
            forecastMessage += `Tarih: ${currentDate}\nŞehir: ${city}\nSıcaklık: ${temperature}°C\nHava Durumu: ${weather}\n\n`;

            // Tahminleri ekleyelim
            forecastMessage += `**Günlük Tahminler**:\n`;
            forecast.forEach(day => {
                forecastMessage += `${day.gun}: ${day.sicaklik}°C, Rüzgar: ${day.ruzgar}\n`;
            });

            message.channel.send(forecastMessage);
        } else {
            message.channel.send("Hava durumu verisi alınamadı. Şehir ismini kontrol edin.");
        }
    }

    // Eğer mesaj '!81il' komutuyla gelirse, 81 ilin hava durumunu paylaşır
    if (message.content === '!81il') {
        for (const region in regions) {
            let regionMessage = `**${region} Bölgesi Hava Durumu**:\n\n`;
            for (const city of regions[region]) {
                const weatherData = await fetchWeather(city);
                if (weatherData) {
                    const { temperature, weather, city: cityName } = weatherData;
                    const currentDate = new Date().toLocaleString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    regionMessage += `**${cityName}:** ${temperature}°C, ${weather}\n`;
                } else {
                    regionMessage += `**${city}:** Hava durumu bilgisi alınamadı.\n`;
                }
            }
            regionMessage += '\n---------------------------------------\n'; // Bölge arasına çizgi ekle
            message.channel.send(regionMessage); // Bölge mesajını gönder
        }
    }
});

client.login(discordToken); // Botu Discord'a bağla
