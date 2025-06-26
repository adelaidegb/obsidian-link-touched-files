import { Debouncer, Plugin, TAbstractFile, TFile, debounce, moment } from 'obsidian';
import { createDailyNote, getAllDailyNotes, getDailyNote, getDailyNoteSettings } from 'obsidian-daily-notes-interface';

interface LinkTouchedFilesSettings {
    updateDelay: number;
    frontmatterField: string;
    // TODO decide how to support allow/deny list for file changes: pattern, prefix, etc.
}

const DEFAULT_SETTINGS: LinkTouchedFilesSettings = {
    updateDelay: 2500,
    frontmatterField: 'touched',
}

export default class LinkTouchedFiles extends Plugin {

    settings: LinkTouchedFilesSettings;
    pending: Map<string, TFile> = new Map();
    scheduleUpdate: Debouncer<[], Promise<void>>;

    async onload() {
        await this.loadSettings();

        // Delay updates until after file updates stop
        this.scheduleUpdate = debounce(
            this.resolveAndUpdate.bind(this),
            Math.max(0, this.settings.updateDelay),
            true
        );

        this.app.workspace.onLayoutReady(() => {
            // Use onLayoutReady so we do not capture file "creation" events that are sent when Obsidian starts
            this.app.vault.on('create', this.onFileChange.bind(this));
            this.app.vault.on('modify', this.onFileChange.bind(this));
        });

        // this.addSettingTab(new LinkTouchedFilesSettingTab(this.app, this));
    }

    /**
     * Record a file change and call to update the current target file where links are intended to go.
     * The update processing call will be debounced for a delay.
     */
    private async onFileChange(file: TAbstractFile) {
        if (!(file instanceof TFile)) {
            return;
        }

        const dailyNotesFolder = getDailyNoteSettings().folder;

        if (dailyNotesFolder && file.path.startsWith(dailyNotesFolder)) {
            return;
        }

        this.pending.set(file.path, file);
        this.scheduleUpdate();
    }

    /**
     * Get the current daily note file, or create it if not present.
     */
    private async getOrCreateDailyNote() {
        const instant = moment();

        return getDailyNote(instant, getAllDailyNotes()) ?? createDailyNote(instant);
    }

    /**
     * Resolve the current file. Update the frontmatter property to add any items not already present.
     */
    private async resolveAndUpdate() {
        await this.app.fileManager.processFrontMatter(await this.getOrCreateDailyNote(), fm => {
            const links: string[] = fm[this.settings.frontmatterField];

            for (const link of links) {
                this.pending.delete(link.substring(2, link.indexOf('|')));
            }

            for (const file of this.pending.values()) {
                links.push(`[[${file.path}|${file.basename}]]`);
            }
        });

        this.pending.clear();
    }

    private async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    private async saveSettings() {
        await this.saveData(this.settings);
    }
}

// class LinkTouchedFilesSettingTab extends PluginSettingTab {
// 	constructor(app: App, private plugin: LinkTouchedFiles) {
// 		super(app, plugin);
// 	}

// 	display(): void {
// 		const {containerEl} = this;

// 		containerEl.empty();
// 	}
// }
