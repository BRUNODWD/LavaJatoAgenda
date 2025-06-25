package com.example.lavajatoagenda

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Locale

class AgendaViewModel(context: Context) : ViewModel() {

    private val dao = AppDataBase.getDatabase(context).agendamentoDao()
    private val repository = AgendaRepository(dao)

    private val _agendamentos = MutableStateFlow<List<Agendamento>>(emptyList())
    val agendamentos: StateFlow<List<Agendamento>> = _agendamentos

    init {
        carregarAgendamentos()
    }

    private fun carregarAgendamentos() {
        viewModelScope.launch {
            val formatter = SimpleDateFormat("HH:mm", Locale.getDefault())
            _agendamentos.value = repository
                .listarTodos()
                .sortedBy {
                    try {
                        formatter.parse(it.horario)
                    } catch (e: Exception) {
                        formatter.parse("00:00")
                    }
                }
        }
    }


    fun adicionarAgendamento(nome: String, modelo: String, horario: String) {
        viewModelScope.launch {
            val agendamento = Agendamento(nome = nome, modelo = modelo, horario = horario)
            repository.inserir(agendamento)
            carregarAgendamentos()
        }
    }

    fun deletarAgendamento(agendamento: Agendamento) {
        viewModelScope.launch {
            repository.deletarAgendamento(agendamento)
            carregarAgendamentos()
        }
    }
}

