const { glob } = require("glob");
const { promisify } = require("util");
const { Client, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

const globPromise = promisify(glob);

module.exports = async (client) => {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 LOADING BOT MODULES');
    console.log('='.repeat(60));

    client.commands = new Collection();
    client.buttons = new Collection();
    client.modals = new Collection();
    client.slashCommands = new Collection();

    let commandCount = 0;
    let buttonCount = 0;
    let modalCount = 0;
    let eventCount = 0;

    try {
        console.log('\n📝 Loading Commands...');
        const commandFiles = await globPromise(`${process.cwd()}/Commands/**/*.js`);
        
        if (commandFiles.length === 0) {
            console.warn('⚠️ No command files found in /Commands directory');
        }

        for (const filePath of commandFiles) {
            try {
                delete require.cache[require.resolve(filePath)];
                const file = require(filePath);
                
                const splitted = filePath.split(path.sep);
                const directory = splitted[splitted.length - 2];

                if (file.name) {
                    const properties = { directory, ...file };
                    client.commands.set(file.name, properties);
                    commandCount++;
                    console.log(`  ✅ [${directory}] ${file.name}${file.aliases ? ` (${file.aliases.join(', ')})` : ''}`);
                } else {
                    console.warn(`  ⚠️ Skipping ${filePath}: missing 'name' property`);
                }
            } catch (error) {
                console.error(`  ❌ Error loading command ${filePath}:`, error.message);
            }
        }

        console.log(`\n📂 Total Commands Loaded: ${commandCount}`);

        console.log('\n🎭 Loading Events...');
        const eventFiles = await globPromise(`${process.cwd()}/Events/*.js`);
        
        if (eventFiles.length === 0) {
            console.warn('⚠️ No event files found in /Events directory');
        }

        for (const filePath of eventFiles) {
            try {
                delete require.cache[require.resolve(filePath)];
                require(filePath);
                
                const fileName = path.basename(filePath, '.js');
                eventCount++;
                console.log(`  ✅ ${fileName}`);
            } catch (error) {
                console.error(`  ❌ Error loading event ${filePath}:`, error.message);
            }
        }

        console.log(`\n📂 Total Events Loaded: ${eventCount}`);

        console.log('\n🔘 Loading Buttons...');
        const buttonsFolder = await globPromise(`${process.cwd()}/Tombol/**/*.js`);
        
        if (buttonsFolder.length === 0) {
            console.warn('⚠️ No button files found in /Tombol directory');
        }

        for (const filePath of buttonsFolder) {
            try {
                delete require.cache[require.resolve(filePath)];
                const file = require(filePath);
                
                if (file.id) {
                    client.buttons.set(file.id, file);
                    buttonCount++;
                    console.log(`  ✅ ${file.id}`);
                } else {
                    console.warn(`  ⚠️ Skipping ${filePath}: missing 'id' property`);
                }
            } catch (error) {
                console.error(`  ❌ Error loading button ${filePath}:`, error.message);
            }
        }

        console.log(`\n📂 Total Buttons Loaded: ${buttonCount}`);

        console.log('\n📋 Loading Modals...');
        const modalsFolder = await globPromise(`${process.cwd()}/Modals/*.js`);
        
        if (modalsFolder.length === 0) {
            console.warn('⚠️ No modal files found in /Modals directory');
        }

        for (const filePath of modalsFolder) {
            try {
                delete require.cache[require.resolve(filePath)];
                const file = require(filePath);
                
                if (file.id) {
                    client.modals.set(file.id, file);
                    modalCount++;
                    console.log(`  ✅ ${file.id}`);
                } else {
                    console.warn(`  ⚠️ Skipping ${filePath}: missing 'id' property`);
                }
            } catch (error) {
                console.error(`  ❌ Error loading modal ${filePath}:`, error.message);
            }
        }

        console.log(`\n📂 Total Modals Loaded: ${modalCount}`);

        console.log('\n' + '='.repeat(60));
        console.log('📊 LOADING SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Commands: ${commandCount}`);
        console.log(`✅ Events: ${eventCount}`);
        console.log(`✅ Buttons: ${buttonCount}`);
        console.log(`✅ Modals: ${modalCount}`);
        console.log('='.repeat(60));
        console.log('👨‍💻 Created by: Axel (Drgxel), Ozi (Mozi)');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ CRITICAL ERROR IN CORE LOADER:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }

    client.reloadCommands = async () => {
        console.log('\n🔄 Reloading Commands...');
        
        client.commands.clear();
        let reloadCount = 0;

        try {
            const commandFiles = await globPromise(`${process.cwd()}/Commands/**/*.js`);
            
            for (const filePath of commandFiles) {
                try {
                    delete require.cache[require.resolve(filePath)];
                    const file = require(filePath);
                    
                    const splitted = filePath.split(path.sep);
                    const directory = splitted[splitted.length - 2];

                    if (file.name) {
                        const properties = { directory, ...file };
                        client.commands.set(file.name, properties);
                        reloadCount++;
                    }
                } catch (error) {
                    console.error(`  ❌ Error reloading ${filePath}:`, error.message);
                }
            }

            console.log(`✅ Reloaded ${reloadCount} commands`);
            return reloadCount;
        } catch (error) {
            console.error('❌ Error during command reload:', error);
            return 0;
        }
    };

    client.reloadButtons = async () => {
        console.log('\n🔄 Reloading Buttons...');
        
        client.buttons.clear();
        let reloadCount = 0;

        try {
            const buttonsFolder = await globPromise(`${process.cwd()}/Tombol/**/*.js`);
            
            for (const filePath of buttonsFolder) {
                try {
                    delete require.cache[require.resolve(filePath)];
                    const file = require(filePath);
                    
                    if (file.id) {
                        client.buttons.set(file.id, file);
                        reloadCount++;
                    }
                } catch (error) {
                    console.error(`  ❌ Error reloading ${filePath}:`, error.message);
                }
            }

            console.log(`✅ Reloaded ${reloadCount} buttons`);
            return reloadCount;
        } catch (error) {
            console.error('❌ Error during button reload:', error);
            return 0;
        }
    };

    client.reloadModals = async () => {
        console.log('\n🔄 Reloading Modals...');
        
        client.modals.clear();
        let reloadCount = 0;

        try {
            const modalsFolder = await globPromise(`${process.cwd()}/Modals/*.js`);
            
            for (const filePath of modalsFolder) {
                try {
                    delete require.cache[require.resolve(filePath)];
                    const file = require(filePath);
                    
                    if (file.id) {
                        client.modals.set(file.id, file);
                        reloadCount++;
                    }
                } catch (error) {
                    console.error(`  ❌ Error reloading ${filePath}:`, error.message);
                }
            }

            console.log(`✅ Reloaded ${reloadCount} modals`);
            return reloadCount;
        } catch (error) {
            console.error('❌ Error during modal reload:', error);
            return 0;
        }
    };

    client.getModuleStats = () => {
        return {
            commands: client.commands.size,
            buttons: client.buttons.size,
            modals: client.modals.size,
            events: eventCount
        };
    };

    client.listCommands = () => {
        const commandList = [];
        client.commands.forEach((cmd, name) => {
            commandList.push({
                name: name,
                aliases: cmd.aliases || [],
                description: cmd.description || 'No description',
                category: cmd.directory || 'Unknown'
            });
        });
        return commandList;
    };

    client.listButtons = () => {
        const buttonList = [];
        client.buttons.forEach((btn, id) => {
            buttonList.push({
                id: id,
                description: btn.description || 'No description'
            });
        });
        return buttonList;
    };

    client.listModals = () => {
        const modalList = [];
        client.modals.forEach((modal, id) => {
            modalList.push({
                id: id,
                description: modal.description || 'No description'
            });
        });
        return modalList;
    };
};