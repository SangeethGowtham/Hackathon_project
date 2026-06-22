import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
import kagglehub

def train_model():
    print("Downloading dataset from Kaggle...")
    # This will download or return the cached path
    dataset_path = kagglehub.dataset_download("preetrank/indian-currency-real-vs-fake-notes-dataset")
    print(f"Dataset ready at: {dataset_path}")
    
    # Check dataset structure. Assuming folders like `dataset_path/Real` and `dataset_path/Fake`
    # or `dataset_path/train/Real`, etc. We use a generic ImageFolder approach if structured properly.
    # For a hackathon, we assume the root or a subfolder contains the classes.
    
    # We will look for subdirectories that act as classes
    train_dir = os.path.join(dataset_path, "train") if os.path.exists(os.path.join(dataset_path, "train")) else dataset_path

    # Transformations for MobileNetV2
    data_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    try:
        image_dataset = datasets.ImageFolder(train_dir, data_transforms)
        dataloader = DataLoader(image_dataset, batch_size=32, shuffle=True, num_workers=2)
        class_names = image_dataset.classes
        print(f"Found classes: {class_names}")
    except Exception as e:
        print(f"Error loading dataset structure: {e}")
        print("Please ensure the dataset has subfolders for 'Real' and 'Fake' categories.")
        return

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")

    # Load pre-trained MobileNetV2
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    
    # Freeze earlier layers for faster transfer learning
    for param in model.parameters():
        param.requires_grad = False
        
    # Replace the classifier head (MobileNetV2 has `classifier` module)
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, len(class_names))
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier[1].parameters(), lr=0.001)

    num_epochs = 3 # Fast training for hackathon
    
    print("Starting training loop...")
    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        running_corrects = 0

        for inputs, labels in dataloader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            loss = criterion(outputs, labels)

            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

        epoch_loss = running_loss / len(image_dataset)
        epoch_acc = running_corrects.double() / len(image_dataset)
        print(f"Epoch {epoch}/{num_epochs - 1} - Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")

    # Save the model weights and the class mapping
    os.makedirs('models', exist_ok=True)
    save_path = os.path.join('models', 'currency_model.pth')
    
    torch.save({
        'model_state_dict': model.state_dict(),
        'class_names': class_names
    }, save_path)
    
    print(f"Training complete! Model saved to {save_path}")

if __name__ == "__main__":
    train_model()
