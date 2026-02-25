import csv
from typing import Tuple

# Define WeatherData type as an immutable tuple
# (date: str, temperature: float, humidity: float, precipitation: float)
WeatherData = Tuple[str, float, float, float]

def parse_row(row: list[str]) -> WeatherData:
    """Pure function to parse a string row into WeatherData tuple."""
    return (
        row[0],
        float(row[1]),
        float(row[2]),
        float(row[3])
    )

def read_weather_data(filepath: str) -> Tuple[WeatherData, ...]:
    """Reads CSV and returns a tuple of WeatherData (immutable)."""
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader) # skip header
        # Using map to apply parse_row to each row and tuple to ensure immutability
        return tuple(map(parse_row, reader))
