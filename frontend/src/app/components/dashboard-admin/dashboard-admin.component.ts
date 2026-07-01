import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadisticasService } from '../../services/estadisticas.service';
import {
  Chart,
  BarController,
  BarElement,
  PieController,
  ArcElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  PieController,
  ArcElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

type LapsoOpcion = '7d' | '30d' | 'mes' | 'anio' | 'todo' | 'personalizado';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css']
})
export class DashboardAdminComponent implements OnInit {

  chart!: Chart;
  chartComentarios!: Chart;
  chartComentariosPorPublicacion!: Chart;
  sinDatosComentariosPorPublicacion: boolean = false;

  private paletaTorta = [
    '#6366f1', '#22d3ee', '#f472b6', '#facc15',
    '#34d399', '#f97316', '#a78bfa', '#f87171'
  ];

  lapso: LapsoOpcion = '30d';
  desdeCustom: string = '';
  hastaCustom: string = '';

  constructor(
    private estadisticasService: EstadisticasService
  ) {}

  ngOnInit(): void {
    this.cargarGrafico();
    this.cargarGraficoComentarios();
    this.cargarGraficoComentariosPorPublicacion();
  }

  onCambioLapso(): void {
    if (this.lapso === 'personalizado' && (!this.desdeCustom || !this.hastaCustom)) {
      return;
    }
    this.cargarGrafico();
    this.cargarGraficoComentarios();
    this.cargarGraficoComentariosPorPublicacion();
  }

  private calcularRango(): { desde?: string, hasta?: string } {
    const hoy = new Date();
    const formatear = (d: Date) => d.toISOString().split('T')[0];

    switch (this.lapso) {
      case '7d': {
        const desde = new Date();
        desde.setDate(hoy.getDate() - 7);
        return { desde: formatear(desde), hasta: formatear(hoy) };
      }
      case '30d': {
        const desde = new Date();
        desde.setDate(hoy.getDate() - 30);
        return { desde: formatear(desde), hasta: formatear(hoy) };
      }
      case 'mes': {
        const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        return { desde: formatear(desde), hasta: formatear(hoy) };
      }
      case 'anio': {
        const desde = new Date(hoy.getFullYear(), 0, 1);
        return { desde: formatear(desde), hasta: formatear(hoy) };
      }
      case 'personalizado':
        return { desde: this.desdeCustom || undefined, hasta: this.hastaCustom || undefined };
      case 'todo':
      default:
        return {};
    }
  }

  cargarGrafico() {
    const { desde, hasta } = this.calcularRango();

    this.estadisticasService.obtenerPostsPorUsuario(desde, hasta)
      .subscribe(datos => {
        const usuarios = datos.map(x => x.usuario);
        const cantidades = datos.map(x => x.cantidad);

        if (this.chart) {
          this.chart.destroy();
        }

        this.chart = new Chart("graficoPosts", {
          type: "bar",
          data: {
            labels: usuarios,
            datasets: [
              {
                label: "Publicaciones",
                data: cantidades,
                backgroundColor: "rgba(99, 102, 241, 0.75)",
                hoverBackgroundColor: "rgba(129, 140, 248, 0.95)",
                borderColor: "rgba(129, 140, 248, 1)",
                borderWidth: 1.5,
                borderRadius: 6,
                maxBarThickness: 48
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: "#e5e7eb" } },
              tooltip: {
                backgroundColor: "#1f2937",
                titleColor: "#f9fafb",
                bodyColor: "#e5e7eb",
                borderColor: "#6366f1",
                borderWidth: 1
              }
            },
            scales: {
              x: {
                ticks: { color: "#9ca3af" },
                grid: { color: "rgba(255,255,255,0.05)" }
              },
              y: {
                beginAtZero: true,
                ticks: { color: "#9ca3af" },
                grid: { color: "rgba(255,255,255,0.08)" }
              }
            }
          }
        });
      });
  }

  cargarGraficoComentarios() {
    const { desde, hasta } = this.calcularRango();

    this.estadisticasService.obtenerComentariosPorUsuario(desde, hasta)
      .subscribe(datos => {
        const usuarios = datos.map(x => x.usuario);
        const cantidades = datos.map(x => x.cantidad);

        if (this.chartComentarios) {
          this.chartComentarios.destroy();
        }

        this.chartComentarios = new Chart("graficoComentarios", {
          type: "pie",
          data: {
            labels: usuarios,
            datasets: [
              {
                label: "Comentarios",
                data: cantidades,
                backgroundColor: this.paletaTorta,
                borderColor: "#161b22",
                borderWidth: 2,
                hoverOffset: 12
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: { color: "#e5e7eb", padding: 16, usePointStyle: true }
              },
              tooltip: {
                backgroundColor: "#1f2937",
                titleColor: "#f9fafb",
                bodyColor: "#e5e7eb",
                borderColor: "#6366f1",
                borderWidth: 1
              }
            }
          }
        });
      });
  }

  cargarGraficoComentariosPorPublicacion() {
    const { desde, hasta } = this.calcularRango();

    this.estadisticasService.obtenerComentariosPorPublicacion(desde, hasta)
      .subscribe(datos => {
        const publicaciones = datos.map(x => x.publicacion);
        const cantidades = datos.map(x => x.cantidad);

        if (this.chartComentariosPorPublicacion) {
          this.chartComentariosPorPublicacion.destroy();
        }

        // Con 0 o 1 puntos no tiene sentido un gráfico de línea: no hay nada que conectar
        this.sinDatosComentariosPorPublicacion = datos.length < 2;

        if (this.sinDatosComentariosPorPublicacion) {
          return;
        }

        this.chartComentariosPorPublicacion = new Chart("graficoComentariosPorPublicacion", {
          type: "line",
          data: {
            labels: publicaciones,
            datasets: [
              {
                label: "Comentarios por publicación",
                data: cantidades,
                borderColor: "rgba(34, 211, 238, 1)",
                backgroundColor: "rgba(34, 211, 238, 0.15)",
                pointBackgroundColor: "rgba(34, 211, 238, 1)",
                pointBorderColor: "#161b22",
                pointHoverRadius: 6,
                pointRadius: 4,
                borderWidth: 2,
                tension: 0.3,
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: "#e5e7eb" } },
              tooltip: {
                backgroundColor: "#1f2937",
                titleColor: "#f9fafb",
                bodyColor: "#e5e7eb",
                borderColor: "#22d3ee",
                borderWidth: 1
              }
            },
            scales: {
              x: {
                offset: true, // Da margen a los extremos, evita que el primer/último punto quede pegado al borde
                ticks: { color: "#9ca3af", maxRotation: 45, minRotation: 45 },
                grid: { color: "rgba(255,255,255,0.05)" }
              },
              y: {
                beginAtZero: true,
                ticks: { color: "#9ca3af", stepSize: 1 },
                grid: { color: "rgba(255,255,255,0.08)" }
              }
            }
          }
        });
      });
  }
}