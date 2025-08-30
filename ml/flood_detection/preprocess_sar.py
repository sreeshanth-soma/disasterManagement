import rasterio
import numpy as np
import os

def preprocess_sar_image(input_filepath, output_dir, tile_size=(256, 256)):
    """
    Reads a Sentinel-1 GRD image, applies a speckle filter (placeholder),
    normalizes bands, and saves image tiles.
    """
    with rasterio.open(input_filepath) as src:
        # Read VV and VH bands
        vv_band = src.read(1)  # Assuming VV is band 1
        vh_band = src.read(2)  # Assuming VH is band 2

        # Placeholder for speckle filter (e.g., Lee filter)
        # In a real scenario, you would implement or import a speckle filter here.
        print("Applying speckle filter (placeholder)...")
        filtered_vv = vv_band  # No actual filtering implemented yet
        filtered_vh = vh_band  # No actual filtering implemented yet

        # Normalize bands (simple min-max normalization placeholder)
        print("Normalizing bands (placeholder)...")
        normalized_vv = (filtered_vv - np.min(filtered_vv)) / (np.max(filtered_vv) - np.min(filtered_vv))
        normalized_vh = (filtered_vh - np.min(filtered_vh)) / (np.max(vh_band) - np.min(vh_band))

        # Stack bands for tiling
        processed_image = np.stack([normalized_vv, normalized_vh], axis=0)

        # Save tiles
        print(f"Saving tiles to {output_dir}...")
        height, width = processed_image.shape[1], processed_image.shape[2]
        tile_h, tile_w = tile_size

        for y in range(0, height, tile_h):
            for x in range(0, width, tile_w):
                tile = processed_image[:, y:y+tile_h, x:x+tile_w]
                if tile.shape[1] == tile_h and tile.shape[2] == tile_w:
                    # Construct output filepath for the tile
                    tile_filename = f"tile_{os.path.basename(input_filepath).replace('.tif', '')}_{y}_{x}.npy"
                    output_filepath = os.path.join(output_dir, tile_filename)
                    np.save(output_filepath, tile)
                    print(f"Saved {output_filepath}")

    print(f"Preprocessing complete for {input_filepath}")

if __name__ == "__main__":
    # Example usage: Replace with actual input file and output directory
    sample_input_sar_file = "path/to/your/sentinel1_grd_sample.tif"
    output_tiles_directory = "ml/dataset/tiles/"

    # Create output directory if it doesn't exist
    os.makedirs(output_tiles_directory, exist_ok=True)

    # Run preprocessing if a sample file path is provided
    if os.path.exists(sample_input_sar_file):
        preprocess_sar_image(sample_input_sar_file, output_tiles_directory)
    else:
        print(f"Sample input SAR file not found at {sample_input_sar_file}. Please provide a valid path.")

# Required Libraries:
# - rasterio: For reading and writing geospatial raster datasets. (pip install rasterio)
# - numpy: For numerical operations.
#
# Sentinel-1 GRD Sample Data:
# Sentinel-1 Level-1 GRD (Ground Range Detected) data can be downloaded from various sources.
# You will typically need an account for these platforms.
# - ESA Copernicus Open Access Hub: https://scihub.copernicus.eu/ (Requires registration)
# - Alaska Satellite Facility (ASF) DAAC: https://search.asf.alaska.edu/ (Requires registration)
#
# Note: This script assumes the input SAR file is a GeoTIFF with VV and VH bands as band 1 and band 2 respectively.
