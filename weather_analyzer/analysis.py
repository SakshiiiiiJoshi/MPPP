from functools import reduce
from typing import Callable, Tuple
from data_loader import WeatherData

# Extensively using map, filter, reduce with immutability

def filter_data(data: Tuple[WeatherData, ...], condition: Callable[[WeatherData], bool]) -> Tuple[WeatherData, ...]:
    """Pure function to filter data based on a condition."""
    return tuple(filter(condition, data))

def map_data(data: Tuple[WeatherData, ...], transform: Callable[[WeatherData], float | str]) -> Tuple:
    """Pure function to extract or transform a specific column."""
    return tuple(map(transform, data))

def calculate_average(values: Tuple[float, ...]) -> float:
    """Pure function to calculate average using reduce."""
    if not values:
        return 0.0
    total = reduce(lambda acc, x: acc + x, values, 0.0)
    return total / len(values)

def find_maximum(values: Tuple[float, ...]) -> float:
    """Pure function to find max value using reduce."""
    if not values:
        return 0.0
    return reduce(lambda acc, x: acc if acc > x else x, values, values[0])

# --- Domain-Specific Analysis Functions ---

def get_hot_days(data: Tuple[WeatherData, ...], threshold: float = 30.0) -> Tuple[WeatherData, ...]:
    """Returns days with temperature strictly above the threshold."""
    return filter_data(data, lambda x: x[1] > threshold)

def get_average_temperature(data: Tuple[WeatherData, ...]) -> float:
    """Calculates the average temperature for the provided dataset."""
    temps = map_data(data, lambda x: x[1])
    return calculate_average(temps)

def get_max_precipitation(data: Tuple[WeatherData, ...]) -> float:
    """Calculates the max precipitation for the provided dataset."""
    precips = map_data(data, lambda x: x[3])
    return find_maximum(precips)
