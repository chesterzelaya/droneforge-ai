import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as colors
import os
import logging
import json

# Configure logging
logging.basicConfig(
    filename='optical_flow_debug.log',  # Log to a file instead of the terminal
    level=logging.DEBUG,                # Set log level to DEBUG
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def visualize_optical_flow_from_file(file_path):
    try:
        logging.debug(f"Loading data from file: {file_path}")
        
        # Load the JSON data from the .txt file
        with open(file_path, 'r') as f:
            json_data = f.read()
            data_dict = json.loads(json_data)  # Parse JSON data
            logging.debug(f"Data loaded successfully, parsed as JSON.")

        # Convert the dictionary values into a NumPy array of floats
        data_list = list(data_dict.values())  # Get values from the dictionary
        optical_flow_data = np.array(data_list, dtype=np.float32)
        logging.debug("Data converted to NumPy array.")

        # Ensure the data has the correct number of elements (663552)
        if optical_flow_data.size != 663552:
            logging.error(f"Data size mismatch: expected 663552, but got {optical_flow_data.size}")
            raise ValueError(f"Data size mismatch: expected 663552, but got {optical_flow_data.size}")

        # Reshape the data into the original shape (1, 2, 432, 768)
        optical_flow_data = optical_flow_data.reshape((1, 2, 432, 768))
        logging.debug(f"Data reshaped to: {optical_flow_data.shape}")

        # Extract the x and y components of the optical flow
        flow_x = optical_flow_data[0, 0, :, :]
        flow_y = optical_flow_data[0, 1, :, :]
        logging.debug("X and Y components of optical flow extracted.")

        # Calculate the magnitude of the optical flow
        flow_magnitude = np.sqrt(flow_x**2 + flow_y**2)
        logging.debug("Magnitude of optical flow calculated.")

        # Create a custom colormap
        cmap = plt.cm.jet
        norm = colors.Normalize(vmin=flow_magnitude.min(), vmax=flow_magnitude.max())

        # Create a new figure with two subplots
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))

        # Plot the x-component of the optical flow
        im1 = ax1.imshow(flow_x, cmap=cmap, norm=norm)
        ax1.set_title('Optical Flow (X-Component)')
        ax1.axis('off')

        # Add a colorbar to the first subplot
        cbar1 = fig.colorbar(im1, ax=ax1, fraction=0.046, pad=0.04)
        cbar1.set_label('Magnitude')

        # Plot the y-component of the optical flow
        im2 = ax2.imshow(flow_y, cmap=cmap, norm=norm)
        ax2.set_title('Optical Flow (Y-Component)')
        ax2.axis('off')

        # Add a colorbar to the second subplot
        cbar2 = fig.colorbar(im2, ax=ax2, fraction=0.046, pad=0.04)
        cbar2.set_label('Magnitude')

        # Adjust the spacing between subplots
        plt.tight_layout()

        # Show the plot
        plt.show()
        logging.debug("Optical flow visualized successfully.")

    except Exception as e:
        logging.error(f"ERROR: {e}")
        pass


# Construct the path dynamically
file_path = os.path.join(os.path.dirname(__file__), 'output.txt')

# Example usage:
visualize_optical_flow_from_file(file_path)
