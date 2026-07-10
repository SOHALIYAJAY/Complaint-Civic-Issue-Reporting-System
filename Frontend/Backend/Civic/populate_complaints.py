from complaints.models import Complaint

complaints_data = [
    # ROADS
    {'title': 'Pothole on main road', 'Category': 'ROADS', 'Description': 'Large pothole causing traffic issues', 'location_address': 'MG Road', 'location_District': 'Ahmedabad', 'location_taluk': 'City', 'priority_level': 'High', 'status': 'Pending'},
    {'title': 'Road repair needed', 'Category': 'ROADS', 'Description': 'Road surface damaged', 'location_address': 'SG Highway', 'location_District': 'Gandhinagar', 'location_taluk': 'Sector 21', 'priority_level': 'Medium', 'status': 'in-progress'},
    
    # TRAFFIC
    {'title': 'Traffic signal not working', 'Category': 'TRAFFIC', 'Description': 'Signal malfunction at intersection', 'location_address': 'CG Road', 'location_District': 'Ahmedabad', 'location_taluk': 'Navrangpura', 'priority_level': 'Critical', 'status': 'Pending'},
    {'title': 'Heavy traffic congestion', 'Category': 'TRAFFIC', 'Description': 'Daily traffic jam', 'location_address': 'Ashram Road', 'location_District': 'Ahmedabad', 'location_taluk': 'Ellis Bridge', 'priority_level': 'High', 'status': 'Pending'},
    
    # WATER
    {'title': 'Water pipe leakage', 'Category': 'WATER', 'Description': 'Major water leak on street', 'location_address': 'Paldi', 'location_District': 'Ahmedabad', 'location_taluk': 'Paldi', 'priority_level': 'Critical', 'status': 'in-progress'},
    {'title': 'No water supply', 'Category': 'WATER', 'Description': 'Water supply disrupted', 'location_address': 'Satellite', 'location_District': 'Ahmedabad', 'location_taluk': 'Satellite', 'priority_level': 'High', 'status': 'Pending'},
    
    # SEWERAGE
    {'title': 'Sewage overflow', 'Category': 'SEWERAGE', 'Description': 'Sewage overflowing on road', 'location_address': 'Vastrapur', 'location_District': 'Ahmedabad', 'location_taluk': 'Vastrapur', 'priority_level': 'Critical', 'status': 'Pending'},
    {'title': 'Blocked drainage', 'Category': 'SEWERAGE', 'Description': 'Drainage system blocked', 'location_address': 'Bodakdev', 'location_District': 'Ahmedabad', 'location_taluk': 'Bodakdev', 'priority_level': 'High', 'status': 'in-progress'},
    
    # SANITATION
    {'title': 'Garbage not collected', 'Category': 'SANITATION', 'Description': 'Garbage piling up for 3 days', 'location_address': 'Maninagar', 'location_District': 'Ahmedabad', 'location_taluk': 'Maninagar', 'priority_level': 'High', 'status': 'Pending'},
    {'title': 'Dustbin overflowing', 'Category': 'SANITATION', 'Description': 'Public dustbin full', 'location_address': 'Naranpura', 'location_District': 'Ahmedabad', 'location_taluk': 'Naranpura', 'priority_level': 'Medium', 'status': 'resolved'},
    
    # LIGHTING
    {'title': 'Street light not working', 'Category': 'LIGHTING', 'Description': 'Multiple street lights off', 'location_address': 'Thaltej', 'location_District': 'Ahmedabad', 'location_taluk': 'Thaltej', 'priority_level': 'Medium', 'status': 'Pending'},
    {'title': 'Dark street at night', 'Category': 'LIGHTING', 'Description': 'No lighting on entire street', 'location_address': 'Gota', 'location_District': 'Gandhinagar', 'location_taluk': 'Gota', 'priority_level': 'High', 'status': 'in-progress'},
    
    # PARKS
    {'title': 'Park maintenance needed', 'Category': 'PARKS', 'Description': 'Park equipment broken', 'location_address': 'Law Garden', 'location_District': 'Ahmedabad', 'location_taluk': 'Ellisbridge', 'priority_level': 'Low', 'status': 'Pending'},
    {'title': 'Garden overgrown', 'Category': 'PARKS', 'Description': 'Public garden needs cleaning', 'location_address': 'Kankaria', 'location_District': 'Ahmedabad', 'location_taluk': 'Kankaria', 'priority_level': 'Medium', 'status': 'Pending'},
    
    # ANIMALS
    {'title': 'Stray dogs in area', 'Category': 'ANIMALS', 'Description': 'Pack of stray dogs causing issues', 'location_address': 'Bopal', 'location_District': 'Ahmedabad', 'location_taluk': 'Bopal', 'priority_level': 'High', 'status': 'Pending'},
    {'title': 'Cattle on road', 'Category': 'ANIMALS', 'Description': 'Stray cattle blocking traffic', 'location_address': 'Sarkhej', 'location_District': 'Ahmedabad', 'location_taluk': 'Sarkhej', 'priority_level': 'Medium', 'status': 'in-progress'},
    
    # ILLEGAL_CONSTRUCTION
    {'title': 'Unauthorized construction', 'Category': 'ILLEGAL_CONSTRUCTION', 'Description': 'Building without permission', 'location_address': 'Chandkheda', 'location_District': 'Ahmedabad', 'location_taluk': 'Chandkheda', 'priority_level': 'High', 'status': 'Pending'},
    {'title': 'Illegal extension', 'Category': 'ILLEGAL_CONSTRUCTION', 'Description': 'Unauthorized floor added', 'location_address': 'Nikol', 'location_District': 'Ahmedabad', 'location_taluk': 'Nikol', 'priority_level': 'Medium', 'status': 'Pending'},
    
    # ENCROACHMENT
    {'title': 'Footpath encroachment', 'Category': 'ENCROACHMENT', 'Description': 'Shops blocking footpath', 'location_address': 'Relief Road', 'location_District': 'Ahmedabad', 'location_taluk': 'Kalupur', 'priority_level': 'High', 'status': 'Pending'},
    {'title': 'Road encroachment', 'Category': 'ENCROACHMENT', 'Description': 'Vendors blocking road', 'location_address': 'Lal Darwaja', 'location_District': 'Ahmedabad', 'location_taluk': 'Lal Darwaja', 'priority_level': 'Medium', 'status': 'in-progress'},
    
    # PROPERTY_DAMAGE
    {'title': 'Bus stop damaged', 'Category': 'PROPERTY_DAMAGE', 'Description': 'Public bus stop vandalized', 'location_address': 'Shivranjani', 'location_District': 'Ahmedabad', 'location_taluk': 'Satellite', 'priority_level': 'Medium', 'status': 'Pending'},
    {'title': 'Park bench broken', 'Category': 'PROPERTY_DAMAGE', 'Description': 'Public benches damaged', 'location_address': 'Sabarmati', 'location_District': 'Ahmedabad', 'location_taluk': 'Sabarmati', 'priority_level': 'Low', 'status': 'resolved'},
    
    # ELECTRICITY
    {'title': 'Power outage', 'Category': 'ELECTRICITY', 'Description': 'Frequent power cuts', 'location_address': 'Vastral', 'location_District': 'Ahmedabad', 'location_taluk': 'Vastral', 'priority_level': 'Critical', 'status': 'Pending'},
    {'title': 'Transformer issue', 'Category': 'ELECTRICITY', 'Description': 'Transformer making noise', 'location_address': 'Odhav', 'location_District': 'Ahmedabad', 'location_taluk': 'Odhav', 'priority_level': 'High', 'status': 'in-progress'},
    
    # OTHER
    {'title': 'Public toilet maintenance', 'Category': 'OTHER', 'Description': 'Public toilet needs repair', 'location_address': 'Jamalpur', 'location_District': 'Ahmedabad', 'location_taluk': 'Jamalpur', 'priority_level': 'Medium', 'status': 'Pending'},
    {'title': 'Community hall issue', 'Category': 'OTHER', 'Description': 'Community hall door broken', 'location_address': 'Rakhial', 'location_District': 'Ahmedabad', 'location_taluk': 'Rakhial', 'priority_level': 'Low', 'status': 'Pending'},
]

for data in complaints_data:
    Complaint.objects.create(**data)
    print(f"Created: {data['title']} - {data['Category']}")

print(f"\nTotal complaints: {Complaint.objects.count()}")
