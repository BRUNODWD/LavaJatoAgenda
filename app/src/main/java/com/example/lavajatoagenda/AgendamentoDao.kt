package com.example.lavajatoagenda

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update

@Dao
interface AgendamentoDao {
    @Insert
    suspend fun inserir(agendamento: Agendamento)

    @Update
    suspend fun atualizar(agendamento: Agendamento)

    @Delete
    suspend fun deletar(agendamento: Agendamento)

    @Query("SELECT * FROM agendamento")
    suspend fun listarTodos(): List<Agendamento>
}

