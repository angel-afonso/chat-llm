import { load } from '@tauri-apps/plugin-store';
import { createOpenAI } from '@ai-sdk/openai';
import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

type ProviderType = 'ollama' | 'groq' | 'google';

interface OllamaSettings {
    baseURL: string;
}

interface GroqSettings {
    apiKey: string;
}

interface GoogleSettings {
    apiKey: string;
}

type ProviderSettingsMap = {
    ollama: OllamaSettings;
    groq: GroqSettings;
    google: GoogleSettings;
};

interface AppSettings {
    providers: {
        [K in ProviderType]: ProviderSettingsMap[K];
    };
}

const SETTINGS_KEY = 'app_settings';
const store = await load('.settings.json');

const providerCreators: {
    [K in ProviderType]: (settings: ProviderSettingsMap[K]) => any;
} = {
    ollama: (settings) => createOpenAI({ baseURL: settings.baseURL }),
    groq: (settings) => createGroq({ apiKey: settings.apiKey }),
    google: (settings) => createGoogleGenerativeAI({ apiKey: settings.apiKey }),
};

class Settings {
    private static instance: Settings;
    private settings: AppSettings | null = null;

    private constructor() { }

    public static getInstance(): Settings {
        if (!Settings.instance) {
            Settings.instance = new Settings();
        }
        return Settings.instance;
    }

    private async ensureSettingsLoaded(): Promise<void> {
        if (!this.settings) {
            await this.loadSettings();
        }
    }

    private async loadSettings(): Promise<void> {
        try {
            const savedSettings = await store.get<AppSettings>(SETTINGS_KEY);
            if (savedSettings) {
                this.settings = savedSettings;
            } else {
                this.settings = this.getDefaultSettings();
                await this.saveSettings();
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.settings = this.getDefaultSettings();
        }
    }

    private getDefaultSettings(): AppSettings {
        return {
            providers: {
                ollama: { baseURL: 'http://localhost:11434/v1/' },
                groq: { apiKey: '' },
                google: { apiKey: '' },
            },
        };
    }

    public async getSettings(): Promise<AppSettings> {
        await this.ensureSettingsLoaded();
        return this.settings!;
    }

    public async updateProviderSettings<K extends ProviderType>(
        provider: K,
        newSettings: Partial<ProviderSettingsMap[K]>
    ): Promise<void> {
        await this.ensureSettingsLoaded();
        Object.assign(this.settings!.providers[provider], newSettings);
        await this.saveSettings();
    }

    private async saveSettings(): Promise<void> {
        try {
            await store.set(SETTINGS_KEY, this.settings);
            await store.save();
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    public async getProviderSettings<K extends ProviderType>(
        provider: K
    ): Promise<ProviderSettingsMap[K]> {
        await this.ensureSettingsLoaded();
        return this.settings!.providers[provider];
    }

    public async getProvider<K extends ProviderType>(provider: K) {
        await this.ensureSettingsLoaded();
        const settings = await this.getProviderSettings(provider);
        const creator = providerCreators[provider];
        return creator(settings);
    }
}

export const settings = Settings.getInstance();
