package com.example.lavajatoagenda.com.example.lavajatoagenda.ui.theme

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.lavajatoagenda.AgendaViewModel

@Composable
fun TelaAgenda(viewModel: AgendaViewModel) {
    val agendamentos by viewModel.agendamentos.collectAsState()

    var nome by remember { mutableStateOf("") }
    var modelo by remember { mutableStateOf("") }
    var horario by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Formulário
        OutlinedTextField(
            value = nome,
            onValueChange = { nome = it },
            label = { Text("Nome do cliente") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = modelo,
            onValueChange = { modelo = it },
            label = { Text("Modelo do carro") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = horario,
            onValueChange = { horario = it },
            label = { Text("Horário de retirada") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                if (nome.isNotBlank() && modelo.isNotBlank() && horario.isNotBlank()) {
                    viewModel.adicionarAgendamento(nome, modelo, horario)
                    nome = ""
                    modelo = ""
                    horario = ""
                }
            },
            modifier = Modifier.align(Alignment.End)
        ) {
            Text("Agendar")
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Lista de agendamentos com botão de deletar
        LazyColumn {
            items(agendamentos) { agendamento ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    colors = CardDefaults.cardColors(MaterialTheme.colorScheme.secondaryContainer)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Cliente: ${agendamento.nome}")
                            Text("Modelo: ${agendamento.modelo}")
                            Text("Horário: ${agendamento.horario}")
                        }
                        IconButton(onClick = {
                            viewModel.deletarAgendamento(agendamento)
                        }) {
                            Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = "Deletar agendamento",
                                tint = MaterialTheme.colorScheme.error
                            )
                        }
                    }
                }
            }
        }
    }
}


