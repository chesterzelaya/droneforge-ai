import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
import json

# Function to read the image data from a .txt file and visualize it with bounding boxes
def visualize_image_from_txt(file_path, detections=None):
    try:
        # Load the data from the .txt file
        with open(file_path, 'r') as f:
            data = f.readlines()

        # Convert the data into a NumPy array of integers (representing pixel values)
        image_data = np.array([int(x.strip()) for x in data], dtype=np.int32)

        # Reshape the data into the original shape (300, 300, 3)
        image_data = image_data.reshape((300, 300, 3))

        # Normalize the pixel values to the range [0, 1] for visualization
        image_data = image_data / 255.0

        # Create a new figure and axis
        fig, ax = plt.subplots(1)

        # Display the image
        ax.imshow(image_data)

        # If detections are provided, draw bounding boxes
        if detections:
            for detection in detections:
                bbox = detection['bbox']
                x, y, width, height = bbox
                
                # Create a Rectangle patch
                rect = Rectangle((x, y), width, height, linewidth=2, edgecolor='r', facecolor='none')
                
                # Add the patch to the axis
                ax.add_patch(rect)
                
                # Add label and score
                label = f"{detection['class']} ({detection['score']:.2f})"
                ax.text(x, y, label, color='red', fontsize=8, verticalalignment='top')

        # Hide the axis for a cleaner image display
        ax.axis('off')

        # Show the plot
        plt.show()

    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage:
# Assuming you have the detection results in a variable called 'detection_results'
# detection_results = [
#     {'bbox': [100, 50, 80, 120], 'class': 'person', 'score': 0.95},
#     {'bbox': [200, 150, 60, 90], 'class': 'dog', 'score': 0.87},
# ]
# visualize_image_from_txt('src/utils/tensorData.txt', detection_results)

# If you don't have detection results, you can still call the function without them:
visualize_image_from_txt('src/utils/tensorData.txt')

# Load detection results
with open('src/utils/detectionResults.json', 'r') as f:
    detection_results = json.load(f)

# Visualize image with detection results
visualize_image_from_txt('src/utils/tensorData.txt', detection_results)
