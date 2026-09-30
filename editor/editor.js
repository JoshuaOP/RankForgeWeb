const SOURCE_CONFIG = {
    defaultRank: "Guest",
    ranks: {
        Guest: {
            "display-name": "§7Guest",
            "next-rank": "Member",
            slot: 10,
            material: "GRAY_WOOL",
            "chat-prefix": "§7[Guest] ",
            lore: ["§7The default starting rank.", "§8No requirements to hold."],
            permissions: [],
            commands: "",
            requirements: {
                money: 0,
                "xp-level": 0,
                permission: ""
            }
        },
        Member: {
            "display-name": "§aMember",
            "next-rank": "Builder",
            slot: 12,
            material: "GREEN_WOOL",
            "chat-prefix": "§a[Member] ",
            lore: [
                "§7Requirements to advance:",
                "  §8• §7Money: §e$5,000",
                "  §8• §7XP Level: §a10",
                "  §8• §7Playtime: §f1hr",
                "  §8• §7Mob Kills: §c25",
                "  §8• §7Block Breaks: §9200"
            ],
            permissions: ["essentials.kits.member", "essentials.home"],
            commands: [
                "broadcast §6✦ §e%player% §aranked up to §aMember§a! ✦",
                "title %player% subtitle {\"text\":\"You are now Member!\",\"color\":\"green\"}"
            ],
            requirements: {
                money: 5000,
                "xp-level": 10,
                playtime: "1hr",
                "mob-kills": 25,
                "block-breaks": 200
            }
        },
        Builder: {
            "display-name": "§9Builder",
            "next-rank": "Expert",
            slot: 14,
            material: "BLUE_WOOL",
            "chat-prefix": "§9[Builder] ",
            lore: [
                "§7Requirements to advance:",
                "  §8• §7Money: §e$15,000",
                "  §8• §7XP Level: §a25",
                "  §8• §7Playtime: §f5hr",
                "  §8• §7Mob Kills: §c100",
                "  §8• §7Block Breaks: §92,000",
                "  §8• §7Quests: §dIntro Quest",
                "  §8• §7Statistic: §6100 Jumps"
            ],
            permissions: ["minecraft.command.gamemode", "worldedit.generation.sphere"],
            commands: ["broadcast §6✦ §e%player% §9ranked up to §9Builder§9! ✦"],
            requirements: {
                money: 15000,
                "xp-level": 25,
                playtime: "5hr",
                "mob-kills": 100,
                "block-breaks": 2000,
                quests: ["intro_quest"],
                "statistic-id": "JUMP",
                "statistic-value": 100
            }
        },
        Expert: {
            "display-name": "§6Expert",
            "next-rank": "Elite",
            slot: 16,
            material: "ORANGE_WOOL",
            "chat-prefix": "§6[Expert] ",
            lore: [
                "§7Requirements to advance:",
                "  §8• §7Money: §e$50,000",
                "  §8• §7XP Level: §a50",
                "  §8• §7Playtime: §f20hr",
                "  §8• §7Mob Kills: §c500",
                "  §8• §7Block Breaks: §910,000",
                "  §8• §7Required Items: §b5x Diamond",
                "  §8• §7Quests: §dIntro & Explore Quests",
                "  §8• §7Location: §aMust be in Overworld (world)"
            ],
            permissions: ["essentials.sethome.multiple.3"],
            commands: ["broadcast §6✦ §e%player% §6ranked up to §6Expert§6! ✦"],
            requirements: {
                money: 50000,
                "xp-level": 50,
                playtime: "20hr",
                "mob-kills": 500,
                "block-breaks": 10000,
                worlds: ["world"],
                items: { DIAMOND: 5 },
                quests: ["intro_quest", "explore_quest"]
            }
        },
        Elite: {
            "display-name": "§c§lElite",
            "next-rank": "Lord",
            slot: 18,
            material: "RED_WOOL",
            "chat-prefix": "§c§l[Elite] ",
            lore: [
                "§7Requirements to advance:",
                "  §8• §7Money: §e$100,000",
                "  §8• §7XP Level: §a100",
                "  §8• §7Playtime: §f4d 4hr",
                "  §8• §7Mob Kills: §c2,000",
                "  §8• §7Block Breaks: §950,000",
                "  §8• §7Required Items: §b1x Nether Star",
                "  §8• §7Quests: §dIntro, Explore & Master Quests",
                "  §8• §7Statistic: §4Fewer than 100 Deaths",
                "  §8• §7Location: §aOverworld, Nether, or End"
            ],
            permissions: ["essentials.fly", "essentials.repair"],
            commands: [
                "broadcast §4✦ §c%player% §6has advanced to §c§lElite§6! ✦",
                "give %player% diamond 5"
            ],
            requirements: {
                money: 100000,
                "xp-level": 100,
                playtime: "4d 4hr",
                "mob-kills": 2000,
                "block-breaks": 50000,
                worlds: ["world", "world_nether", "world_the_end"],
                items: { NETHER_STAR: 1 },
                quests: ["intro_quest", "explore_quest", "master_quest"],
                "statistic-id": "DEATHS",
                "statistic-value": 100
            }
        }
    }
};

const STORAGE_KEY = "rankforge-editor-draft";
const clone = (value) => JSON.parse(JSON.stringify(value));
let state = loadState();
let selectedRank = Object.keys(state.ranks)[0];
let activeView = "visual"; // "visual" or "yaml"

const rankList = document.getElementById("rankList");
const rankForm = document.getElementById("rankForm");
const emptyState = document.getElementById("editorEmpty");
const status = document.getElementById("editorStatus");
const defaultRankInput = document.getElementById("defaultRank");
const importFile = document.getElementById("importFile");

// View Switcher Elements
const tabVisual = document.getElementById("tabVisual");
const tabYaml = document.getElementById("tabYaml");
const visualViewContent = document.getElementById("visualViewContent");
const yamlViewContent = document.getElementById("yamlViewContent");
const yamlPreviewCode = document.getElementById("yamlPreviewCode");
const previewCopyBtn = document.getElementById("previewCopyBtn");

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : clone(SOURCE_CONFIG);
    } catch {
        return clone(SOURCE_CONFIG);
    }
}

function setStatus(message, saved = false) {
    status.textContent = message;
    status.classList.toggle("saved", saved);
}

function pathParts(path) {
    return path.split(".");
}

function getPath(object, path) {
    return pathParts(path).reduce((value, key) => value?.[key], object);
}

function setPath(object, path, value) {
    const parts = pathParts(path);
    const last = parts.pop();
    const parent = parts.reduce((current, key) => current[key], object);
    parent[last] = value;
}

function rank() {
    return state.ranks[selectedRank];
}

function renderRankList() {
    rankList.innerHTML = Object.entries(state.ranks).map(([id, item]) => `
        <button class="editor-rank ${id === selectedRank ? "active" : ""}" type="button" data-rank="${escapeHtml(id)}">
            <span>${escapeHtml(stripFormatting(item["display-name"] || id))}</span>
            <small>${escapeHtml(id)}</small>
        </button>
    `).join("");
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[character]));
}

function stripFormatting(value) {
    return String(value).replace(/§./g, "");
}

function inputField(label, path, value, type = "text", extra = "") {
    const safeValue = escapeHtml(value);
    return `<div class="editor-field">
        <label>${label}</label>
        <input class="editor-input" type="${type}" data-path="${path}" value="${safeValue}" ${extra}>
    </div>`;
}

function listEditor(label, path, values) {
    const rows = (Array.isArray(values) ? values : []).map((value, index) => `
        <div class="editor-list-row">
            <input class="editor-input" type="text" data-list="${path}" data-index="${index}" value="${escapeHtml(value)}">
            <button class="editor-remove" type="button" data-action="remove-list" data-list="${path}" data-index="${index}" aria-label="Remove item"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `).join("");
    return `<div class="editor-field full">
        <label>${label}</label>
        <div class="editor-list">${rows || `<span class="editor-label">No entries yet.</span>`}</div>
        <button class="editor-add" type="button" data-action="add-list" data-list="${path}"><i class="fa-solid fa-plus"></i> Add entry</button>
    </div>`;
}

function mapEditor(label, path, values) {
    const entries = Object.entries(values || {});
    const rows = entries.map(([key, value], index) => `
        <div class="editor-map-row">
            <input class="editor-input" type="text" data-map="${path}" data-index="${index}" data-part="key" value="${escapeHtml(key)}" placeholder="MATERIAL">
            <input class="editor-input" type="number" min="0" data-map="${path}" data-index="${index}" data-part="value" value="${escapeHtml(value)}" placeholder="Amount">
            <button class="editor-remove" type="button" data-action="remove-map" data-map="${path}" data-index="${index}" aria-label="Remove item"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `).join("");
    return `<div class="editor-field full">
        <label>${label}</label>
        <div class="editor-list">${rows || `<span class="editor-label">No item requirements yet.</span>`}</div>
        <button class="editor-add" type="button" data-action="add-map" data-map="${path}"><i class="fa-solid fa-plus"></i> Add item</button>
    </div>`;
}

function renderForm() {
    const current = rank();
    if (!current) {
        rankForm.hidden = true;
        emptyState.hidden = false;
        return;
    }

    rankForm.hidden = false;
    emptyState.hidden = true;
    const requirements = current.requirements || {};
    rankForm.innerHTML = `
        <section class="editor-card">
            <h2>Identity & display</h2>
            <p>These values control the rank's position and how it appears in the GUI.</p>
            <div class="editor-grid">
                ${inputField("Rank ID", "rank-id", selectedRank, "text", "readonly")}
                ${inputField("Display name", "display-name", current["display-name"] || "")}
                ${inputField("Next rank", "next-rank", current["next-rank"] || "")}
                ${inputField("GUI slot", "slot", current.slot ?? 0, "number", 'min="0" max="53"')}
                ${inputField("Material", "material", current.material || "")}
                ${inputField("Chat prefix", "chat-prefix", current["chat-prefix"] || "")}
                ${listEditor("Lore", "lore", current.lore || [])}
            </div>
        </section>
        <section class="editor-card">
            <h2>Requirements</h2>
            <p>Every configured requirement is checked before this rank can promote to its next rank.</p>
            <div class="editor-grid">
                ${inputField("Money", "requirements.money", requirements.money ?? 0, "number", 'min="0" step="0.01"')}
                ${inputField("XP level", "requirements.xp-level", requirements["xp-level"] ?? 0, "number", 'min="0"')}
                ${inputField("Playtime", "requirements.playtime", requirements.playtime || "")}
                ${inputField("Mob kills", "requirements.mob-kills", requirements["mob-kills"] ?? 0, "number", 'min="0"')}
                ${inputField("Block breaks", "requirements.block-breaks", requirements["block-breaks"] ?? 0, "number", 'min="0"')}
                ${inputField("Permission", "requirements.permission", requirements.permission || "")}
                ${inputField("Statistic ID", "requirements.statistic-id", requirements["statistic-id"] || "")}
                ${inputField("Statistic value", "requirements.statistic-value", requirements["statistic-value"] ?? 0, "number", 'min="0"')}
                ${listEditor("Quest IDs", "requirements.quests", requirements.quests || [])}
                ${listEditor("Worlds", "requirements.worlds", requirements.worlds || [])}
                ${mapEditor("Required items", "requirements.items", requirements.items || {})}
            </div>
        </section>
        <section class="editor-card">
            <h2>Rewards</h2>
            <p>Permissions are granted while the player holds this rank. Commands run on rankup; use <code>%player%</code> for the player's name.</p>
            <div class="editor-grid">
                ${listEditor("Permission nodes", "permissions", current.permissions || [])}
                ${listEditor("Rankup commands", "commands", Array.isArray(current.commands) ? current.commands : (current.commands ? [current.commands] : []))}
            </div>
        </section>
        <section class="editor-card">
            <h2>Preview</h2>
            <div class="editor-preview">
                <div class="editor-preview-icon"><i class="fa-solid fa-crown"></i></div>
                <div>
                    <h3 id="previewName">${escapeHtml(stripFormatting(current["display-name"] || selectedRank))}</h3>
                    <p id="previewMeta">${escapeHtml(current.material || "No material")} · slot ${escapeHtml(current.slot ?? 0)} · next: ${escapeHtml(current["next-rank"] || "final rank")}</p>
                </div>
            </div>
        </section>
    `;
}

function updatePreview() {
    const current = rank();
    const name = document.getElementById("previewName");
    const meta = document.getElementById("previewMeta");
    if (!current || !name || !meta) return;
    name.textContent = stripFormatting(current["display-name"] || selectedRank);
    meta.textContent = `${current.material || "No material"} · slot ${current.slot ?? 0} · next: ${current["next-rank"] || "final rank"}`;
}

function updateYamlPreview() {
    if (yamlPreviewCode) {
        yamlPreviewCode.textContent = toYaml();
    }
}

function switchView(view) {
    activeView = view;
    if (view === "visual") {
        tabVisual.className = "btn btn-primary";
        tabYaml.className = "btn btn-secondary";
        visualViewContent.style.display = "block";
        yamlViewContent.style.display = "none";
    } else {
        tabVisual.className = "btn btn-secondary";
        tabYaml.className = "btn btn-primary";
        visualViewContent.style.display = "none";
        yamlViewContent.style.display = "block";
        updateYamlPreview();
    }
}

function inputValue(target) {
    if (target.type === "number") {
        return target.value === "" ? 0 : Number(target.value);
    }
    return target.value;
}

function handleFormInput(event) {
    const target = event.target;
    if (target.dataset.path && target.dataset.path !== "rank-id") {
        setPath(rank(), target.dataset.path, inputValue(target));
        setStatus("Unsaved changes");
        updatePreview();
    }
    if (target.dataset.list) {
        const values = getPath(rank(), target.dataset.list) || [];
        values[Number(target.dataset.index)] = target.value;
        setStatus("Unsaved changes");
    }
    if (target.dataset.map) {
        updateMapValue(target);
        setStatus("Unsaved changes");
    }
    if (activeView === "yaml") {
        updateYamlPreview();
    }
}

function updateMapValue(target) {
    const path = target.dataset.map;
    const entries = Object.entries(getPath(rank(), path) || {});
    const index = Number(target.dataset.index);
    if (!entries[index]) return;
    const [key, value] = entries[index];
    const nextKey = target.dataset.part === "key" ? target.value : key;
    const nextValue = target.dataset.part === "value" ? Number(target.value || 0) : value;
    const map = {};
    entries.forEach((entry, entryIndex) => {
        map[entryIndex === index ? nextKey : entry[0]] = entryIndex === index ? nextValue : entry[1];
    });
    setPath(rank(), path, map);
}

function handleFormAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "add-list") {
        const values = getPath(rank(), button.dataset.list) || [];
        values.push("");
        setPath(rank(), button.dataset.list, values);
    }
    if (action === "remove-list") {
        const values = getPath(rank(), button.dataset.list) || [];
        values.splice(Number(button.dataset.index), 1);
        setPath(rank(), button.dataset.list, values);
    }
    if (action === "add-map") {
        const values = getPath(rank(), button.dataset.map) || {};
        values[`MATERIAL_${Object.keys(values).length + 1}`] = 1;
        setPath(rank(), button.dataset.map, values);
    }
    if (action === "remove-map") {
        const entries = Object.entries(getPath(rank(), button.dataset.map) || {});
        entries.splice(Number(button.dataset.index), 1);
        setPath(rank(), button.dataset.map, Object.fromEntries(entries));
    }
    renderForm();
    setStatus("Unsaved changes");
    if (activeView === "yaml") {
        updateYamlPreview();
    }
}

function yamlString(value) {
    return JSON.stringify(String(value ?? ""));
}

function yamlList(lines, indent, values) {
    const prefix = " ".repeat(indent);
    if (!values?.length) return `${prefix}[]`;
    return values.map((value) => `${prefix}- ${yamlString(value)}`).join("\n");
}

function yamlMap(lines, indent, values) {
    const prefix = " ".repeat(indent);
    const entries = Object.entries(values || {});
    if (!entries.length) return `${prefix}{}`;
    return entries.map(([key, value]) => `${prefix}${key}: ${Number(value)}`).join("\n");
}

function toYaml() {
    const lines = [
        "# RankForge — Rank Definitions",
        "# Generated by the RankForge web editor.",
        `default-rank: ${yamlString(state.defaultRank)}`,
        "",
        "ranks:"
    ];
    Object.entries(state.ranks).forEach(([id, item]) => {
        const requirements = item.requirements || {};
        lines.push(`  ${id}:`);
        lines.push(`    display-name: ${yamlString(item["display-name"])}`);
        lines.push(`    next-rank: ${yamlString(item["next-rank"])}`);
        lines.push(`    slot: ${Number(item.slot || 0)}`);
        lines.push(`    material: ${item.material || "STONE"}`);
        lines.push(`    chat-prefix: ${yamlString(item["chat-prefix"])}`);
        lines.push("    lore:");
        lines.push(yamlList(lines, 6, item.lore));
        lines.push("    permissions:");
        lines.push(yamlList(lines, 6, item.permissions));
        lines.push("    commands:");
        lines.push(yamlList(lines, 6, Array.isArray(item.commands) ? item.commands : []));
        lines.push("    requirements:");
        ["money", "xp-level", "permission", "playtime", "mob-kills", "block-breaks", "statistic-id", "statistic-value"].forEach((key) => {
            if (requirements[key] !== undefined && requirements[key] !== "") {
                const value = typeof requirements[key] === "number" ? requirements[key] : yamlString(requirements[key]);
                lines.push(`      ${key}: ${value}`);
            }
        });
        lines.push("      quests:");
        lines.push(yamlList(lines, 8, requirements.quests));
        lines.push("      worlds:");
        lines.push(yamlList(lines, 8, requirements.worlds));
        lines.push("      items:");
        lines.push(yamlMap(lines, 8, requirements.items));
    });
    return `${lines.join("\n")}\n`;
}

// Simple YAML parser for basic RankForge ranks.yml structures
function parseYaml(yamlText) {
    const lines = yamlText.split(/\r?\n/);
    let defaultRank = "Guest";
    const ranks = {};
    let currentRankId = null;
    let currentSection = null; // null, 'lore', 'permissions', 'commands', 'requirements', 'quests', 'worlds', 'items'

    for (let line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const indent = line.search(/\S/);

        if (indent === 0) {
            if (trimmed.startsWith("default-rank:")) {
                const parts = trimmed.split(":");
                if (parts.length > 1) {
                    defaultRank = parts.slice(1).join(":").trim().replace(/^["']|["']$/g, "");
                }
            }
            currentSection = null;
        } else if (indent === 2 && trimmed.endsWith(":")) {
            const key = trimmed.slice(0, -1).trim();
            if (key === "ranks") continue;
            currentRankId = key;
            ranks[currentRankId] = {
                "display-name": "",
                "next-rank": "",
                slot: 0,
                material: "STONE",
                "chat-prefix": "",
                lore: [],
                permissions: [],
                commands: [],
                requirements: {
                    money: 0,
                    "xp-level": 0,
                    permission: "",
                    playtime: "",
                    "mob-kills": 0,
                    "block-breaks": 0,
                    quests: [],
                    worlds: [],
                    items: {}
                }
            };
            currentSection = null;
        } else if (currentRankId && indent === 4) {
            if (trimmed.endsWith(":")) {
                const sectionKey = trimmed.slice(0, -1).trim();
                if (["lore", "permissions", "commands"].includes(sectionKey)) {
                    currentSection = sectionKey;
                } else if (sectionKey === "requirements") {
                    currentSection = "requirements_parent";
                }
                continue;
            }

            const colonIndex = trimmed.indexOf(":");
            if (colonIndex !== -1) {
                const key = trimmed.slice(0, colonIndex).trim();
                let val = trimmed.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, "");
                if (!isNaN(val) && val !== "") val = Number(val);

                if (key === "display-name") ranks[currentRankId]["display-name"] = val;
                else if (key === "next-rank") ranks[currentRankId]["next-rank"] = val;
                else if (key === "slot") ranks[currentRankId].slot = Number(val) || 0;
                else if (key === "material") ranks[currentRankId].material = val;
                else if (key === "chat-prefix") ranks[currentRankId]["chat-prefix"] = val;
                currentSection = null;
            } else if (trimmed.startsWith("-") && currentSection && ["lore", "permissions", "commands"].includes(currentSection)) {
                let val = trimmed.slice(1).trim().replace(/^["']|["']$/g, "");
                ranks[currentRankId][currentSection].push(val);
            }
        } else if (currentRankId && indent >= 6) {
            if (currentSection === "requirements_parent" || indent === 6) {
                if (trimmed.endsWith(":")) {
                    const reqSubKey = trimmed.slice(0, -1).trim();
                    if (["quests", "worlds", "items"].includes(reqSubKey)) {
                        currentSection = reqSubKey;
                    }
                    continue;
                }

                const colonIndex = trimmed.indexOf(":");
                if (colonIndex !== -1) {
                    const key = trimmed.slice(0, colonIndex).trim();
                    let val = trimmed.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, "");
                    if (!isNaN(val) && val !== "" && key !== "playtime" && key !== "permission" && key !== "statistic-id") {
                        val = Number(val);
                    }
                    ranks[currentRankId].requirements[key] = val;
                }
            }

            if (trimmed.startsWith("-") && ["quests", "worlds"].includes(currentSection)) {
                let val = trimmed.slice(1).trim().replace(/^["']|["']$/g, "");
                ranks[currentRankId].requirements[currentSection].push(val);
            } else if (currentSection === "items" && !trimmed.startsWith("-")) {
                const colonIndex = trimmed.indexOf(":");
                if (colonIndex !== -1) {
                    const itemKey = trimmed.slice(0, colonIndex).trim();
                    const itemVal = Number(trimmed.slice(colonIndex + 1).trim()) || 1;
                    ranks[currentRankId].requirements.items[itemKey] = itemVal;
                }
            }
        }
    }

    if (Object.keys(ranks).length === 0) {
        throw new Error("No valid ranks found in YAML file.");
    }

    return { defaultRank, ranks };
}

function saveDraft() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setStatus("Draft saved in this browser", true);
}

function downloadYaml() {
    const blob = new Blob([toYaml()], { type: "text/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ranks.yml";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("YAML exported", true);
}

async function copyYaml() {
    try {
        await navigator.clipboard.writeText(toYaml());
        setStatus("YAML copied to clipboard", true);
    } catch {
        setStatus("Clipboard access was blocked; use Export YAML instead");
    }
}

function addRank() {
    let id = "NewRank";
    let count = 2;
    while (state.ranks[id]) id = `NewRank${count++}`;
    state.ranks[id] = {
        "display-name": id,
        "next-rank": "",
        slot: 0,
        material: "STONE",
        "chat-prefix": "",
        lore: [],
        permissions: [],
        commands: [],
        requirements: {
            money: 0,
            "xp-level": 0,
            permission: "",
            playtime: "",
            "mob-kills": 0,
            "block-breaks": 0,
            quests: [],
            worlds: [],
            items: {}
        }
    };
    selectedRank = id;
    renderRankList();
    renderForm();
    setStatus("New rank added");
    if (activeView === "yaml") {
        updateYamlPreview();
    }
}

function resetDraft() {
    if (!window.confirm("Reset this browser draft to the imported ranks.yml values?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = clone(SOURCE_CONFIG);
    selectedRank = Object.keys(state.ranks)[0];
    defaultRankInput.value = state.defaultRank;
    renderRankList();
    renderForm();
    setStatus("Draft reset", true);
    if (activeView === "yaml") {
        updateYamlPreview();
    }
}

rankList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-rank]");
    if (!button) return;
    selectedRank = button.dataset.rank;
    renderRankList();
    renderForm();
    setStatus(`Editing ${selectedRank}`);
});

rankForm.addEventListener("input", handleFormInput);
rankForm.addEventListener("change", handleFormInput);
rankForm.addEventListener("click", handleFormAction);
defaultRankInput.addEventListener("input", () => {
    state.defaultRank = defaultRankInput.value;
    setStatus("Unsaved changes");
    if (activeView === "yaml") {
        updateYamlPreview();
    }
});

// View Toggle Listeners
if (tabVisual && tabYaml) {
    tabVisual.addEventListener("click", () => switchView("visual"));
    tabYaml.addEventListener("click", () => switchView("yaml"));
}

if (previewCopyBtn) {
    previewCopyBtn.addEventListener("click", copyYaml);
}

document.getElementById("addRank").addEventListener("click", addRank);
document.getElementById("saveDraft").addEventListener("click", saveDraft);
document.getElementById("exportYaml").addEventListener("click", downloadYaml);
document.getElementById("copyYaml").addEventListener("click", copyYaml);
document.getElementById("resetDraft").addEventListener("click", resetDraft);

// Import file handlers
const importYamlBtn = document.getElementById("importYaml");
if (importYamlBtn) {
    importYamlBtn.addEventListener("click", () => importFile.click());
}

if (importFile) {
    importFile.addEventListener("change", (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const parsed = parseYaml(text);
                state = parsed;
                selectedRank = Object.keys(state.ranks)[0] || "";
                defaultRankInput.value = state.defaultRank;
                renderRankList();
                renderForm();
                setStatus(`Successfully imported ${file.name}`, true);
                if (activeView === "yaml") {
                    updateYamlPreview();
                }
            } catch (err) {
                setStatus(`Failed to parse YAML file: ${err.message}`);
            }
            importFile.value = "";
        };
        reader.readAsText(file);
    });
}

renderRankList();
renderForm();
defaultRankInput.value = state.defaultRank;
setStatus("Loaded from the imported ranks.yml snapshot");
