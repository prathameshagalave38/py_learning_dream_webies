import random

def calculate_shipping_rate(origin_pincode: str, dest_pincode: str, weight_kg: float) -> dict:
    """
    Simulates a Shiprocket / Delhivery API rate lookup.
    Calculates rate based on weight, and computes a simulated distance from pincodes.
    """
    # Clean pincodes (default to standard codes if invalid)
    op = "".join(filter(str.isdigit, origin_pincode or "110001"))
    dp = "".join(filter(str.isdigit, dest_pincode or "400001"))
    
    if len(op) != 6:
        op = "110001"
    if len(dp) != 6:
        dp = "400001"
        
    # Calculate simulated distance factor based on difference of first two digits
    try:
        dist_factor = abs(int(op[:2]) - int(dp[:2]))
    except ValueError:
        dist_factor = 3
        
    # Standard rates
    base_rate = 40.0
    weight_rate = max(0.0, weight_kg) * 15.0  # Rs 15 per kg
    distance_rate = dist_factor * 12.0        # Rs 12 per region step
    
    total_rate = round(base_rate + weight_rate + distance_rate, 2)
    
    # Estimate shipping time
    if dist_factor == 0:
        days = 2  # Same zone
    elif dist_factor <= 2:
        days = 3  # Near zones
    elif dist_factor <= 5:
        days = 5  # Medium zones
    else:
        days = 7  # Far regions (e.g. northeast, islands)
        
    # Select mock carrier
    carriers = ["Delhivery", "Shadowfax", "BlueDart", "Xpressbees"]
    carrier = random.choice(carriers)
    
    return {
        "provider": "Shiprocket",
        "carrier": carrier,
        "rate": total_rate,
        "estimated_days": days,
        "origin_pincode": op,
        "destination_pincode": dp,
        "weight_kg": weight_kg,
        "tracking_prefix": f"SR{carrier[:2].upper()}"
    }
