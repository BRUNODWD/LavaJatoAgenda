package com.example.lavajatoagenda

class AgendaRepository(private val dao: AgendamentoDao) {
    suspend fun inserir(agendamento: Agendamento) = dao.inserir(agendamento)
    suspend fun atualizar(agendamento: Agendamento) = dao.atualizar(agendamento)
    suspend fun deletarAgendamento(agendamento: Agendamento) = dao.deletar(agendamento)
    suspend fun listarTodos(): List<Agendamento> = dao.listarTodos()

}
