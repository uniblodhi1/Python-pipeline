"""
Publication-Quality Plot Configuration

Import this module in your scripts to create research paper-ready figures.

Usage:
    from plot_config import setup_publication_plot, save_publication_figure

    # Setup for publication quality
    setup_publication_plot()

    # Create your plot
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(x, y)
    ax.set_xlabel("Year")
    ax.set_ylabel("Emissions (tCO₂)")

    # Save with high quality settings
    save_publication_figure(fig, "outputs/01_emissions_plot.png")
"""

import matplotlib.pyplot as plt
import matplotlib as mpl
from pathlib import Path

# ============================================================================
# PUBLICATION QUALITY SETTINGS
# ============================================================================

def setup_publication_plot():
    """
    Configure matplotlib for publication-quality figures.

    Settings optimized for:
    - Academic journals
    - High-resolution printing
    - Professional presentations
    - Research papers
    """

    # Figure settings
    plt.rcParams['figure.dpi'] = 300  # High resolution for publication
    plt.rcParams['savefig.dpi'] = 300  # Save at 300 DPI (journal standard)
    plt.rcParams['figure.figsize'] = (10, 6)  # Default size in inches

    # Font settings - professional appearance
    plt.rcParams['font.family'] = 'serif'
    plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif']
    plt.rcParams['font.size'] = 12
    plt.rcParams['axes.labelsize'] = 14
    plt.rcParams['axes.titlesize'] = 16
    plt.rcParams['xtick.labelsize'] = 12
    plt.rcParams['ytick.labelsize'] = 12
    plt.rcParams['legend.fontsize'] = 11

    # Line and marker settings
    plt.rcParams['lines.linewidth'] = 2.0
    plt.rcParams['lines.markersize'] = 6

    # Axes settings
    plt.rcParams['axes.linewidth'] = 1.2
    plt.rcParams['axes.grid'] = True
    plt.rcParams['grid.alpha'] = 0.3
    plt.rcParams['grid.linestyle'] = '--'
    plt.rcParams['grid.linewidth'] = 0.8

    # Legend settings
    plt.rcParams['legend.frameon'] = True
    plt.rcParams['legend.framealpha'] = 0.9
    plt.rcParams['legend.edgecolor'] = 'gray'

    # Remove top and right spines for cleaner look
    plt.rcParams['axes.spines.top'] = False
    plt.rcParams['axes.spines.right'] = False

    # Tick settings
    plt.rcParams['xtick.major.width'] = 1.2
    plt.rcParams['ytick.major.width'] = 1.2
    plt.rcParams['xtick.direction'] = 'out'
    plt.rcParams['ytick.direction'] = 'out'

    # Better colors for publication (colorblind-friendly palette)
    plt.rcParams['axes.prop_cycle'] = mpl.cycler(color=[
        '#0173B2',  # Blue
        '#DE8F05',  # Orange
        '#029E73',  # Green
        '#CC78BC',  # Purple
        '#CA9161',  # Brown
        '#949494',  # Gray
        '#ECE133',  # Yellow
        '#56B4E9'   # Light blue
    ])


def save_publication_figure(fig, output_path, formats=['png', 'pdf'], **kwargs):
    """
    Save figure in publication quality with multiple formats.

    Parameters:
    -----------
    fig : matplotlib.figure.Figure
        The figure to save
    output_path : str or Path
        Output file path (without extension, or with primary extension)
    formats : list
        List of formats to save ['png', 'pdf', 'svg', 'eps']
    **kwargs : additional arguments for savefig

    Returns:
    --------
    list : paths of saved files

    Example:
    --------
    >>> fig, ax = plt.subplots()
    >>> ax.plot([1, 2, 3], [4, 5, 6])
    >>> save_publication_figure(fig, "outputs/my_plot.png")
    """
    output_path = Path(output_path)
    base_path = output_path.with_suffix('')  # Remove extension if present

    # Default save parameters for publication quality
    save_params = {
        'dpi': 300,
        'bbox_inches': 'tight',  # Remove extra whitespace
        'pad_inches': 0.1,
        'facecolor': 'white',
        'edgecolor': 'none',
        'transparent': False
    }
    save_params.update(kwargs)  # Allow user overrides

    saved_files = []
    for fmt in formats:
        output_file = base_path.with_suffix(f'.{fmt}')
        output_file.parent.mkdir(parents=True, exist_ok=True)

        # Special handling for different formats
        if fmt == 'pdf':
            fig.savefig(output_file, format='pdf', **save_params)
        elif fmt == 'svg':
            fig.savefig(output_file, format='svg', **save_params)
        elif fmt == 'eps':
            fig.savefig(output_file, format='eps', **save_params)
        else:  # png and others
            fig.savefig(output_file, format=fmt, **save_params)

        saved_files.append(output_file)
        print(f"✓ Saved: {output_file}")

    return saved_files


def create_figure(nrows=1, ncols=1, figsize=None, **kwargs):
    """
    Create a publication-ready figure with subplots.

    Parameters:
    -----------
    nrows, ncols : int
        Number of subplot rows and columns
    figsize : tuple or None
        Figure size in inches. If None, uses default publication size
    **kwargs : additional arguments for plt.subplots

    Returns:
    --------
    fig, ax : matplotlib figure and axes

    Example:
    --------
    >>> fig, ax = create_figure(figsize=(12, 8))
    >>> ax.plot([1, 2, 3], [4, 5, 6])
    """
    if figsize is None:
        # Calculate reasonable size based on subplot grid
        width = 10 if ncols == 1 else 6 * ncols
        height = 6 if nrows == 1 else 4 * nrows
        figsize = (width, height)

    fig, ax = plt.subplots(nrows=nrows, ncols=ncols, figsize=figsize, **kwargs)
    return fig, ax


# ============================================================================
# HELPER FUNCTIONS FOR COMMON PLOT TYPES
# ============================================================================

def format_axis_thousands(ax, axis='y'):
    """
    Format axis to show thousands with comma separators.

    Parameters:
    -----------
    ax : matplotlib axes
    axis : str
        'x', 'y', or 'both'
    """
    from matplotlib.ticker import FuncFormatter

    def thousands(x, pos):
        return f'{int(x):,}'

    formatter = FuncFormatter(thousands)

    if axis in ['y', 'both']:
        ax.yaxis.set_major_formatter(formatter)
    if axis in ['x', 'both']:
        ax.xaxis.set_major_formatter(formatter)


def add_watermark(ax, text="Draft", alpha=0.15, **kwargs):
    """
    Add a watermark to the plot (useful for draft versions).

    Parameters:
    -----------
    ax : matplotlib axes
    text : str
        Watermark text
    alpha : float
        Transparency (0-1)
    **kwargs : additional text properties
    """
    ax.text(0.5, 0.5, text,
            transform=ax.transAxes,
            fontsize=60,
            color='gray',
            alpha=alpha,
            ha='center',
            va='center',
            rotation=30,
            **kwargs)


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    import numpy as np

    # Setup publication settings
    setup_publication_plot()

    # Create sample data
    years = np.arange(2010, 2024)
    emissions = np.random.randint(1000, 5000, size=len(years))

    # Create figure
    fig, ax = create_figure(figsize=(10, 6))

    # Plot data
    ax.plot(years, emissions, marker='o', label='Total Emissions')
    ax.set_xlabel('Year')
    ax.set_ylabel('Emissions (tCO₂)')
    ax.set_title('Annual Emissions Trend')
    ax.legend()

    # Format y-axis with thousands separator
    format_axis_thousands(ax, axis='y')

    # Save in multiple formats
    save_publication_figure(fig, 'outputs/example_plot', formats=['png', 'pdf'])

    print("\n✓ Example plot created successfully!")
    print("Check outputs/ folder for high-quality images.")
