const { sql, getPool } = require('../config/database');
sql.MAX = -1;

class Task {
  static async getAll() {
    try {
      const pool = await getPool();
      const result = await pool.request().query(`
        SELECT id, codiceTask, descrizione, dataSegnalazione, dataScadenza, stato,
               software, utente, clienti, priorità, commenti, createdBy
        FROM Task
        ORDER BY dataSegnalazione DESC
      `);
      return result.recordset;
    } catch (error) {
      throw new Error(`Errore nel recupero task: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT id, codiceTask, descrizione, dataSegnalazione, dataScadenza, stato,
                 software, utente, clienti, priorità, commenti, createdBy
          FROM Task
          WHERE id = @id
        `);
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Errore nel recupero task: ${error.message}`);
    }
  }

  static async create(taskData) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('codiceTask', sql.NVarChar(50), taskData.codiceTask)
        .input('descrizione', sql.NVarChar(255), taskData.descrizione)
        .input('dataSegnalazione', sql.DateTime2, taskData.dataSegnalazione)
        .input('dataScadenza', sql.DateTime2, taskData.dataScadenza)
        .input('stato', sql.NVarChar(30), taskData.stato)
        .input('software', sql.NVarChar(50), taskData.software)
        .input('utente', sql.NVarChar(30), taskData.utente)
        .input('clienti', sql.NVarChar(50), taskData.clienti)
        .input('priorità', sql.NVarChar(30), taskData.priorità)
        .input('commenti', sql.NVarChar(4000), taskData.commenti)
        .input('createdBy', sql.Int, taskData.createdBy)
        .query(`
          INSERT INTO Task (codiceTask, descrizione, dataSegnalazione, dataScadenza, stato,
                            software, utente, clienti, priorità, commenti, createdBy)
          OUTPUT INSERTED.*
          VALUES (@codiceTask, @descrizione, @dataSegnalazione, @dataScadenza, @stato,
                  @software, @utente, @clienti, @priorità, @commenti, @createdBy)
        `);
        await this.createLog({
          utente: taskData.utente,
          codiceTask: taskData.codiceTask,
          eventLog: `Task creato: ${taskData.descrizione}`
        });
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Errore nella creazione del task: ${error.message}`);
    }
  }

  static async update(id, taskData) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('codiceTask', sql.NVarChar(50), taskData.codiceTask)
        .input('descrizione', sql.NVarChar(255), taskData.descrizione)
        .input('dataSegnalazione', sql.DateTime2, taskData.dataSegnalazione)
        .input('dataScadenza', sql.DateTime2, taskData.dataScadenza)
        .input('stato', sql.NVarChar(30), taskData.stato)
        .input('software', sql.NVarChar(50), taskData.software)
        .input('utente', sql.NVarChar(30), taskData.utente)
        .input('clienti', sql.NVarChar(50), taskData.clienti)
        .input('priorità', sql.NVarChar(30), taskData.priorità)
        .input('commenti', sql.NVarChar(4000), taskData.commenti)
        .query(`
          UPDATE Task
          SET codiceTask = @codiceTask,
              descrizione = @descrizione,
              dataSegnalazione = @dataSegnalazione,
              dataScadenza = @dataScadenza,
              stato = @stato,
              software = @software,
              utente = @utente,
              clienti = @clienti,
              priorità = @priorità,
              commenti = @commenti
          WHERE id = @id
        `);
        const getResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Task WHERE id = @id');
      await this.createLog({
        utente: taskData.utente,
        codiceTask: taskData.codiceTask,
        eventLog: `Task aggiornato: ${taskData.descrizione}`
      });
      return getResult.recordset[0];
    } catch (error) {
      throw new Error(`Errore nell'aggiornamento del task: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const pool = await getPool();
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Task WHERE id = @id');
        await this.createLog({
        utente: 'System', // o l'utente che ha effettuato l'azione
        codiceTask: task.codiceTask,
        eventLog: `Task eliminato: ${task.descrizione}`
      });
      return true;
    } catch (error) {
      throw new Error(`Errore nell'eliminazione del task: ${error.message}`);
    }
  }

  static async createLog(logData) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('utente', sql.NVarChar(50), logData.utente)
        .input('codiceTask', sql.NVarChar(50), logData.codiceTask)
        .input('eventLog', sql.NVarChar(sql.MAX), logData.eventLog)
        .input('data', sql.DateTime2, new Date())
        .query(`
          INSERT INTO taskLog (utente, codiceTask, eventLog, data)
          OUTPUT INSERTED.*
          VALUES (@utente, @codiceTask, @eventLog, @data)
        `);
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Errore nella creazione del log: ${error.message}`);
    }
  }

  static async getLogs(codiceTask = null) {
    try {
      const pool = await getPool();
      let query = `
        SELECT id, utente, codiceTask, eventLog, data
        FROM taskLog
        ORDER BY data DESC
      `;
      
      if (codiceTask) {
        query = `
          SELECT id, utente, codiceTask, eventLog, data
          FROM taskLog
          WHERE codiceTask = @codiceTask
          ORDER BY data DESC
        `;
      }

      const request = pool.request();
      if (codiceTask) {
        request.input('codiceTask', sql.NVarChar(50), codiceTask);
      }

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Errore nel recupero logs: ${error.message}`);
    }
  }

  static async getLogsByUser(utente) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('utente', sql.NVarChar(50), utente)
        .query(`
          SELECT id, utente, codiceTask, eventLog, data
          FROM taskLog
          WHERE utente = @utente
          ORDER BY data DESC
        `);
      return result.recordset;
    } catch (error) {
      throw new Error(`Errore nel recupero logs utente: ${error.message}`);
    }
  }
}

module.exports = Task;
