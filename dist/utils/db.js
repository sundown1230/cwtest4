export async function query(db, sql, params = []) {
    try {
        const result = await db.prepare(sql).bind(...params).all();
        return result.results;
    }
    catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
export async function execute(db, sql, params = []) {
    try {
        return await db.prepare(sql).bind(...params).run();
    }
    catch (error) {
        console.error('Database execute error:', error);
        throw error;
    }
}
