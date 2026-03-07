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

from flask import Flask, jsonify, render_template
import os
from data_loader import read_weather_data
from analysis import (
    get_hot_days,
    get_average_temperature,
    get_max_precipitation
)

app = Flask(__name__)

@app.route("/")
def index():
    # Serve the main client-side application structure
    return render_template("index.html")

@app.route("/api/weather")
def weather():
    # Optional backend proxy route matching user request 
    data_path = os.path.join(os.path.dirname(__file__), "weather_data.csv")
    
    if not os.path.exists(data_path):
        return jsonify({"error": f"Could not find {data_path}"}), 404

    # Read from local CSV
    weather_data = read_weather_data(data_path)
    
    avg_temp = get_average_temperature(weather_data)
    max_precip = get_max_precipitation(weather_data)
    
    # Return quick JSON summary metrics
    return jsonify({
        "records_loaded": len(weather_data),
        "average_temperature_c": round(avg_temp, 2),
        "maximum_precipitation_mm": round(max_precip, 2)
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

