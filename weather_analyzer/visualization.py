import matplotlib.pyplot as plt
from typing import Tuple
from data_loader import WeatherData
from analysis import map_data

def plot_temperature_trend(data: Tuple[WeatherData, ...], output_path: str = "temperature_trend.png") -> None:
    """Extracts data purely, but has side effects (saving plot) encapsulated."""
    if not data:
        return
        
    dates = map_data(data, lambda x: x[0])
    temps = map_data(data, lambda x: x[1])

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(dates, temps, marker='o', linestyle='-', color='tab:red')
    ax.set_title("Temperature Trend Over Time")
    ax.set_xlabel("Date")
    ax.set_ylabel("Temperature (°C)")
    plt.xticks(rotation=45)
    plt.tight_layout()

    fig.savefig(output_path)
    plt.close(fig)

def plot_precipitation_histogram(data: Tuple[WeatherData, ...], output_path: str = "precipitation_hist.png") -> None:
    """Extracts data purely and generates a histogram."""
    if not data:
        return
        
    precips = map_data(data, lambda x: x[3])

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.hist(precips, bins=min(10, len(precips) or 1), color='tab:blue', edgecolor='black')
    ax.set_title("Precipitation Distribution")
    ax.set_xlabel("Precipitation (mm)")
    ax.set_ylabel("Frequency")

    fig.savefig(output_path)
    plt.close(fig)
