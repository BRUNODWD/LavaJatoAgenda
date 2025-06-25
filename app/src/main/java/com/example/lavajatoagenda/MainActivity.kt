package com.example.lavajatoagenda

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.lavajatoagenda.com.example.lavajatoagenda.ui.theme.TelaAgenda
import com.example.lavajatoagenda.ui.theme.LavaJatoAgendaTheme

class MainActivity : ComponentActivity() {

    private val viewModel: AgendaViewModel by viewModels {
        AgendaViewModelFactory(applicationContext)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            LavaJatoAgendaTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    TelaAgenda(viewModel)
                }
            }
        }
    }
}

