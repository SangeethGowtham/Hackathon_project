import csv
import random
import os

def generate_data():
    num_victims = 100
    num_phones = 20
    num_banks = 10
    num_devices = 15

    victims = [f"V{i:03d}" for i in range(1, num_victims + 1)]
    phones = [f"P{i:03d}" for i in range(1, num_phones + 1)]
    banks = [f"B{i:03d}" for i in range(1, num_banks + 1)]
    devices = [f"D{i:03d}" for i in range(1, num_devices + 1)]

    # We want to create some clustered structures
    # Let's say phones 1-5 exclusively use banks 1-2 and devices 1-3
    cluster_1 = {
        'phones': phones[0:5],
        'banks': banks[0:2],
        'devices': devices[0:3]
    }
    
    # Phones 6-12 use banks 3-6 and devices 4-8
    cluster_2 = {
        'phones': phones[5:12],
        'banks': banks[2:6],
        'devices': devices[3:8]
    }
    
    # The rest are random
    
    data = []
    
    for v in victims:
        # Determine if this victim is in a cluster
        r = random.random()
        if r < 0.4:
            # Cluster 1 (highly coordinated)
            p = random.choice(cluster_1['phones'])
            b = random.choice(cluster_1['banks'])
            d = random.choice(cluster_1['devices'])
        elif r < 0.7:
            # Cluster 2
            p = random.choice(cluster_2['phones'])
            b = random.choice(cluster_2['banks'])
            d = random.choice(cluster_2['devices'])
        else:
            # Random background noise
            p = random.choice(phones)
            b = random.choice(banks)
            d = random.choice(devices)
            
        amount = random.randint(10000, 250000)
        data.append([v, p, b, d, amount])

    filepath = os.path.join(os.path.dirname(__file__), "fraud_dataset.csv")
    with open(filepath, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["victim_id", "phone", "bank_account", "device_id", "amount"])
        writer.writerows(data)
        
    print(f"Generated {len(data)} synthetic fraud records at {filepath}")

if __name__ == "__main__":
    generate_data()
