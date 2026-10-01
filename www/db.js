// Initialize Dexie database
const db = new Dexie('ReisekostenDB');

// Define database schema (Version 1)
db.version(1).stores({
    trips: '++id, name, createdAt',
    categories: '++id, name, createdAt',
    expenses: '++id, tripId, categoryId, amount, note, date, createdAt'
});

// Version 2: Update default categories (flat)
db.version(2).upgrade(async tx => {
    await tx.categories.clear();
});

// Version 3: Hierarchical categories
db.version(3).stores({
    categories: '++id, group, name, sortOrder, createdAt'
}).upgrade(async tx => {
    await tx.categories.clear();
    const newCategories = [
        { group: 'Reise', name: 'Benzin', sortOrder: 1 },
        { group: 'Reise', name: 'Maut', sortOrder: 2 },
        { group: 'Reise', name: 'ÖPNV', sortOrder: 3 },
        { group: 'Reise', name: 'Sonstiges', sortOrder: 4 },
        { group: 'Unterkunft', name: 'Unterkunft', sortOrder: 5 },
        { group: 'Restaurants', name: 'Frühstück', sortOrder: 6 },
        { group: 'Restaurants', name: 'Mittagessen', sortOrder: 7 },
        { group: 'Restaurants', name: 'Abendessen', sortOrder: 8 },
        { group: 'Restaurants', name: 'Bar', sortOrder: 9 },
        { group: 'Restaurants', name: 'Sonstiges', sortOrder: 10 },
        { group: 'Einkäufe', name: 'Essen & Trinken', sortOrder: 11 },
        { group: 'Einkäufe', name: 'Haushaltswaren', sortOrder: 12 },
        { group: 'Einkäufe', name: 'Sonstiges', sortOrder: 13 },
        { group: 'Freizeit', name: 'Eintritte', sortOrder: 14 },
        { group: 'Freizeit', name: 'Ausflüge', sortOrder: 15 },
        { group: 'Freizeit', name: 'Sonstiges', sortOrder: 16 },
        { group: 'Sonstiges', name: 'Sonstiges', sortOrder: 17 }
    ];
    
    await tx.categories.bulkAdd(newCategories.map(c => ({
        ...c,
        createdAt: new Date()
    })));
});

// Database API
const api = {
    // Trips
    async addTrip(name) {
        return await db.trips.add({
            name,
            createdAt: new Date()
        });
    },
    async getTrips() {
        return await db.trips.orderBy('createdAt').reverse().toArray();
    },
    async editTrip(id, newName) {
        return await db.trips.update(id, { name: newName });
    },
    async deleteTrip(id) {
        // Delete all expenses for this trip (using == to catch both integer and legacy string IDs)
        const allExpenses = await db.expenses.toArray();
        const toDelete = allExpenses.filter(e => e.tripId == id).map(e => e.id);
        if (toDelete.length > 0) {
            await db.expenses.bulkDelete(toDelete);
        }
        return await db.trips.delete(id);
    },

    // Categories
    async addCategory(group, name) {
        // Find max sortOrder to append at the end
        const allCats = await this.getCategories();
        let maxSort = 0;
        allCats.forEach(c => { if(c.sortOrder > maxSort) maxSort = c.sortOrder; });

        return await db.categories.add({
            group,
            name,
            sortOrder: maxSort + 1,
            createdAt: new Date()
        });
    },
    async getCategories() {
        return await db.categories.orderBy('sortOrder').toArray();
    },
    async editCategory(id, newGroup, newName) {
        return await db.categories.update(id, { group: newGroup, name: newName });
    },
    async deleteCategory(id) {
        // Optionally handle expenses linked to this category
        return await db.categories.delete(id);
    },

    // Expenses
    async addExpense(tripId, categoryId, amount, note, date, photo) {
        return await db.expenses.add({
            tripId: parseInt(tripId),
            categoryId: parseInt(categoryId),
            amount: parseFloat(amount),
            note: note || '',
            date: date || new Date().toISOString(),
            photo: photo || null,
            createdAt: new Date()
        });
    },
    async getExpenses() {
        return await db.expenses.orderBy('createdAt').reverse().toArray();
    },
    async getExpensesWithDetails() {
        const expenses = await db.expenses.orderBy('date').reverse().toArray();
        const trips = await this.getTrips();
        const cats = await this.getCategories();
        
        const tripMap = {};
        trips.forEach(t => tripMap[t.id] = t.name);
        
        const catMap = {};
        const catGroupMap = {};
        cats.forEach(c => {
            catMap[c.id] = c.name;
            catGroupMap[c.id] = c.group;
        });

        return expenses.map(e => ({
            ...e,
            tripName: tripMap[e.tripId] || 'Unbekannte Reise',
            categoryName: catMap[e.categoryId] || 'Unbekannte Kategorie',
            mainCat: catGroupMap[e.categoryId] || 'Unbekannt',
            subCat: catMap[e.categoryId] || 'Unbekannt'
        }));
    },
    async editExpense(id, amount, note) {
        return await db.expenses.update(id, { 
            amount: parseFloat(amount), 
            note: note || '' 
        });
    },
    async deleteExpense(id) {
        return await db.expenses.delete(id);
    },
    async restoreDefaultCategories() {
        const defaultCategories = [
            { group: 'Reise', name: 'Benzin' },
            { group: 'Reise', name: 'Maut' },
            { group: 'Reise', name: 'ÖPNV' },
            { group: 'Reise', name: 'Sonstiges' },
            { group: 'Unterkunft', name: 'Unterkunft' },
            { group: 'Restaurants', name: 'Frühstück' },
            { group: 'Restaurants', name: 'Mittagessen' },
            { group: 'Restaurants', name: 'Abendessen' },
            { group: 'Restaurants', name: 'Bar' },
            { group: 'Restaurants', name: 'Sonstiges' },
            { group: 'Einkäufe', name: 'Essen & Trinken' },
            { group: 'Einkäufe', name: 'Haushaltswaren' },
            { group: 'Einkäufe', name: 'Sonstiges' },
            { group: 'Freizeit', name: 'Eintritte' },
            { group: 'Freizeit', name: 'Ausflüge' },
            { group: 'Freizeit', name: 'Sonstiges' },
            { group: 'Sonstiges', name: 'Sonstiges' }
        ];
        
        const existing = await this.getCategories();
        let restoredCount = 0;
        
        for (const defCat of defaultCategories) {
            const exists = existing.find(c => c.group === defCat.group && c.name === defCat.name);
            if (!exists) {
                await this.addCategory(defCat.group, defCat.name);
                restoredCount++;
            }
        }
        return restoredCount;
    }
,

    // --- Backup & Restore (JSON Export / Import) ---
    async exportData() {
        const trips = await db.trips.toArray();
        const categories = await db.categories.toArray();
        const expenses = await db.expenses.toArray();
        
        return {
            app: 'Reisekosten',
            version: 1,
            exportDate: new Date().toISOString(),
            trips,
            categories,
            expenses
        };
    },

    async importData(backupData, mode = 'merge') {
        if (!backupData || (!backupData.trips && !backupData.expenses)) {
            throw new Error('Ungültiges Dateiformat. Bitte eine gültige Reisekosten-Backup-Datei (.json) auswählen.');
        }

        const importTrips = backupData.trips || [];
        const importCats = backupData.categories || [];
        const importExpenses = backupData.expenses || [];

        if (mode === 'replace') {
            await db.trips.clear();
            await db.categories.clear();
            await db.expenses.clear();

            if (importTrips.length > 0) await db.trips.bulkAdd(importTrips);
            if (importCats.length > 0) await db.categories.bulkAdd(importCats);
            if (importExpenses.length > 0) await db.expenses.bulkAdd(importExpenses);

            return {
                tripsCount: importTrips.length,
                catsCount: importCats.length,
                expensesCount: importExpenses.length,
                mode: 'replace'
            };
        } else {
            // Mode: Merge
            const tripIdMap = {};
            const existingTrips = await db.trips.toArray();
            for (const t of importTrips) {
                const oldId = t.id;
                const existing = existingTrips.find(et => et.name.trim().toLowerCase() === (t.name || '').trim().toLowerCase());
                if (existing) {
                    tripIdMap[oldId] = existing.id;
                } else {
                    const newId = await db.trips.add({
                        name: t.name,
                        createdAt: t.createdAt ? new Date(t.createdAt) : new Date()
                    });
                    tripIdMap[oldId] = newId;
                }
            }

            const catIdMap = {};
            const existingCats = await db.categories.toArray();
            for (const c of importCats) {
                const oldId = c.id;
                const existing = existingCats.find(ec => ec.group === c.group && ec.name === c.name);
                if (existing) {
                    catIdMap[oldId] = existing.id;
                } else {
                    const newId = await db.categories.add({
                        group: c.group,
                        name: c.name,
                        sortOrder: c.sortOrder || 99,
                        createdAt: c.createdAt ? new Date(c.createdAt) : new Date()
                    });
                    catIdMap[oldId] = newId;
                }
            }

            let addedExpenses = 0;
            for (const e of importExpenses) {
                const targetTripId = tripIdMap[e.tripId] !== undefined ? tripIdMap[e.tripId] : parseInt(e.tripId);
                const targetCatId = catIdMap[e.categoryId] !== undefined ? catIdMap[e.categoryId] : parseInt(e.categoryId);

                await db.expenses.add({
                    tripId: targetTripId,
                    categoryId: targetCatId,
                    amount: parseFloat(e.amount),
                    note: e.note || '',
                    date: e.date || new Date().toISOString(),
                    photo: e.photo || null,
                    createdAt: e.createdAt ? new Date(e.createdAt) : new Date()
                });
                addedExpenses++;
            }

            return {
                tripsCount: Object.keys(tripIdMap).length,
                catsCount: Object.keys(catIdMap).length,
                expensesCount: addedExpenses,
                mode: 'merge'
            };
        }
    }
};

// Populate for completely fresh installs
db.on('populate', async () => {
    const defaultCategories = [
        { group: 'Reise', name: 'Benzin', sortOrder: 1 },
        { group: 'Reise', name: 'Maut', sortOrder: 2 },
        { group: 'Reise', name: 'ÖPNV', sortOrder: 3 },
        { group: 'Reise', name: 'Sonstiges', sortOrder: 4 },
        { group: 'Unterkunft', name: 'Unterkunft', sortOrder: 5 },
        { group: 'Restaurants', name: 'Frühstück', sortOrder: 6 },
        { group: 'Restaurants', name: 'Mittagessen', sortOrder: 7 },
        { group: 'Restaurants', name: 'Abendessen', sortOrder: 8 },
        { group: 'Restaurants', name: 'Bar', sortOrder: 9 },
        { group: 'Restaurants', name: 'Sonstiges', sortOrder: 10 },
        { group: 'Einkäufe', name: 'Essen & Trinken', sortOrder: 11 },
        { group: 'Einkäufe', name: 'Haushaltswaren', sortOrder: 12 },
        { group: 'Einkäufe', name: 'Sonstiges', sortOrder: 13 },
        { group: 'Freizeit', name: 'Eintritte', sortOrder: 14 },
        { group: 'Freizeit', name: 'Ausflüge', sortOrder: 15 },
        { group: 'Freizeit', name: 'Sonstiges', sortOrder: 16 },
        { group: 'Sonstiges', name: 'Sonstiges', sortOrder: 17 }
    ];
    await db.categories.bulkAdd(defaultCategories.map(c => ({...c, createdAt: new Date()})));
});


// Global window exposure
window.db = db;
window.api = api;
