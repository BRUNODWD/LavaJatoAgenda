package com.example.lavajatoagenda

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "agendamento")
data class Agendamento(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val nome: String,
    val modelo: String,
    val horario: String
)

