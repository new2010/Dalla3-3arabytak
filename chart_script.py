import plotly.graph_objects as go

# Create figure
fig = go.Figure()

# Define positions for components (reorganized for better flow)
positions = {
    # Frontend components (top row)
    "index.html": (1, 7),
    "product.html": (3, 7),
    "cart.html": (5, 7),
    "admin.html": (7, 7),
    
    # Static assets (second row)
    "style.css": (1, 5.5),
    "app.js": (3, 5.5),
    "config.js": (5, 5.5),
    
    # Backend (middle)
    "Google Apps Script": (4, 3.5),
    
    # Database (bottom)
    "Google Sheets": (4, 1.5),
    "Products Sheet": (2, 0.5),
    "Orders Sheet": (6, 0.5)
}

# Define component labels with Arabic (shortened for better display)
labels = {
    "index.html": "index.html<br>الصفحة الرئيسية",
    "product.html": "product.html<br>تفاصيل المنتج", 
    "cart.html": "cart.html<br>السلة والدفع",
    "admin.html": "admin.html<br>لوحة الإدارة",
    "style.css": "style.css<br>التصميم",
    "app.js": "app.js<br>الوظائف",
    "config.js": "config.js<br>الإعدادات",
    "Google Apps Script": "Apps Script<br>Code.gs",
    "Google Sheets": "Google Sheets<br>قاعدة البيانات",
    "Products Sheet": "Products<br>المنتجات",
    "Orders Sheet": "Orders<br>الطلبات"
}

# Colors for different component types
colors = {
    "Frontend": "#1FB8CD",
    "Static": "#DB4545", 
    "Backend": "#2E8B57",
    "Database": "#5D878F"
}

# Component groupings
component_groups = {
    "Frontend": ["index.html", "product.html", "cart.html", "admin.html"],
    "Static": ["style.css", "app.js", "config.js"],
    "Backend": ["Google Apps Script"],
    "Database": ["Google Sheets", "Products Sheet", "Orders Sheet"]
}

# Add boxes for each component
box_width = 0.7
box_height = 0.5

for group_name, components in component_groups.items():
    for comp in components:
        if comp in positions:
            x, y = positions[comp]
            fig.add_shape(
                type="rect",
                x0=x-box_width/2, y0=y-box_height/2,
                x1=x+box_width/2, y1=y+box_height/2,
                fillcolor=colors[group_name],
                opacity=0.8,
                line=dict(color="black", width=1)
            )
            fig.add_annotation(
                x=x, y=y,
                text=labels[comp],
                showarrow=False,
                font=dict(size=9, color="white"),
                align="center"
            )

# Add data flow arrows with clear paths
fig.add_shape(
    type="line",
    x0=4, y0=6.5, x1=4, y1=4,
    line=dict(color="red", width=3)
)
fig.add_annotation(
    x=4.5, y=5.2,
    text="API Requests",
    showarrow=False,
    font=dict(size=10, color="red"),
    bgcolor="white",
    bordercolor="red"
)

# Arrow from Apps Script to Google Sheets
fig.add_shape(
    type="line", 
    x0=4, y0=3, x1=4, y1=2,
    line=dict(color="blue", width=3)
)
fig.add_annotation(
    x=4.8, y=2.5,
    text="DB Operations",
    showarrow=False,
    font=dict(size=10, color="blue"),
    bgcolor="white",
    bordercolor="blue"
)

# Arrow from Google Sheets to data sheets
fig.add_shape(
    type="line",
    x0=3.5, y0=1.2, x1=2.5, y1=0.8,
    line=dict(color="green", width=2)
)
fig.add_shape(
    type="line",
    x0=4.5, y0=1.2, x1=5.5, y1=0.8,
    line=dict(color="green", width=2)
)

# Arrow from admin to Apps Script
fig.add_shape(
    type="line",
    x0=6.5, y0=6.5, x1=4.5, y1=4,
    line=dict(color="orange", width=2)
)
fig.add_annotation(
    x=5.8, y=5.5,
    text="Admin Ops",
    showarrow=False,
    font=dict(size=9, color="orange"),
    bgcolor="white",
    bordercolor="orange"
)

# Arrow from cart to Apps Script
fig.add_shape(
    type="line",
    x0=4.8, y0=6.5, x1=4.2, y1=4,
    line=dict(color="purple", width=2)
)
fig.add_annotation(
    x=3.2, y=5.8,
    text="Order Submit",
    showarrow=False,
    font=dict(size=9, color="purple"),
    bgcolor="white",
    bordercolor="purple"
)

# Add arrowheads
arrow_positions = [
    (4, 4),      # Frontend to Apps Script
    (4, 2),      # Apps Script to Sheets
    (2.5, 0.8),  # To Products Sheet
    (5.5, 0.8),  # To Orders Sheet
    (4.5, 4),    # Admin to Apps Script
    (4.2, 4)     # Cart to Apps Script
]

for x, y in arrow_positions:
    fig.add_shape(
        type="path",
        path=f"M {x-0.1},{y-0.1} L {x},{y} L {x+0.1},{y-0.1} Z",
        fillcolor="black",
        line=dict(color="black")
    )

# Update layout
fig.update_layout(
    title="دلع عربيتك System Architecture",
    showlegend=False,
    xaxis=dict(showgrid=False, zeroline=False, showticklabels=False, range=[0, 8]),
    yaxis=dict(showgrid=False, zeroline=False, showticklabels=False, range=[0, 8]),
    plot_bgcolor='white'
)

# Save as both PNG and SVG
fig.write_image("architecture_chart.png")
fig.write_image("architecture_chart.svg", format="svg")