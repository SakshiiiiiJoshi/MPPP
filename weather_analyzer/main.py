import os
from data_loader import read_weather_data
from analysis import (
    get_hot_days,
    get_average_temperature,
    get_max_precipitation
)
from visualization import (
    plot_temperature_trend,
    plot_precipitation_histogram
)

def main() -> None:
    data_path = os.path.join(os.path.dirname(__file__), "weather_data.csv")
    
    if not os.path.exists(data_path):
        print(f"Error: Could not find {data_path}.")
        return

    print("--- Reading Weather Data ---")
    # 1. Read input -> produces immutable structure
    weather_data = read_weather_data(data_path)
    print(f"Loaded {len(weather_data)} records into immutable tuples.")

    # 2. Analyze data
    print("\n--- Performing Functional Analysis ---")
    avg_temp = get_average_temperature(weather_data)
    print(f"Average Temperature: {avg_temp:.2f}°C")

    max_precip = get_max_precipitation(weather_data)
    print(f"Maximum Precipitation: {max_precip:.2f} mm")

    hot_thresh = 30.0
    hot_days = get_hot_days(weather_data, hot_thresh)
    print(f"\nHot Days (> {hot_thresh}°C): {len(hot_days)}")
    for day in hot_days:
        print(f"  - {day[0]}: {day[1]}°C")

    # 3. Visualization
    print("\n--- Generating Plots ---")
    plot_dir = os.path.dirname(__file__)
    
    temp_plot_path = os.path.join(plot_dir, "temperature_trend.png")
    plot_temperature_trend(weather_data, temp_plot_path)
    print(f"Saved: {os.path.basename(temp_plot_path)}")
    
    precip_plot_path = os.path.join(plot_dir, "precipitation_hist.png")
    plot_precipitation_histogram(weather_data, precip_plot_path)
    print(f"Saved: {os.path.basename(precip_plot_path)}")
    
    print("\nAnalysis Complete. All data structures remained immutable throughout.")

if __name__ == "__main__":
    main()
