class DefectInfo:
    def __init__(self, className, stressFactors, priorityLevel, powerLoss, category, CoA, description, recommendations):
        self.className = className
        self.stressFactors = stressFactors
        self.priorityLevel = priorityLevel
        self.powerLoss = powerLoss
        self.category = category
        self.CoA = CoA  # Classes of Abnormalities
        self.description = description
        self.recommendations = recommendations

# Define all defect classes
DEFECT_CLASSES = {
    "partial-shading": DefectInfo(
        className="Partial Shading",
        stressFactors=["Environmental", "External Objects"],
        priorityLevel="Medium",
        powerLoss="15-25%",
        category="Environmental",
        CoA="Thermal Stress",
        description="Occurs when a portion of the solar panel is shaded by objects like trees, buildings, or debris, causing temperature differences and reduced efficiency.",
        recommendations=[
            "Remove or trim nearby vegetation causing shade",
            "Consider repositioning panels if possible",
            "Install micro-inverters or power optimizers",
            "Regular cleaning and maintenance schedule",
            "Monitor shading patterns throughout the day"
        ]
    ),
    
    "dust-deposit": DefectInfo(
        className="Dust Deposit",
        stressFactors=["Environmental", "Maintenance"],
        priorityLevel="Low",
        powerLoss="3-15%",
        category="Maintenance",
        CoA="Surface Contamination",
        description="Accumulation of dust, dirt, or other particles on the surface of solar panels, reducing light transmission and power output.",
        recommendations=[
            "Implement regular cleaning schedule",
            "Install automated cleaning systems",
            "Monitor local air quality and adjust cleaning frequency",
            "Use anti-soiling coatings",
            "Document cleaning history and efficiency impact"
        ]
    ),
    
    "short-circuit": DefectInfo(
        className="Short Circuit",
        stressFactors=["Electrical", "Manufacturing"],
        priorityLevel="High",
        powerLoss="50-100%",
        category="Electrical",
        CoA="Circuit Failure",
        description="Electrical malfunction where current follows an unintended path, potentially causing severe damage and safety hazards.",
        recommendations=[
            "Immediate system shutdown",
            "Professional inspection required",
            "Replace affected components",
            "Check wiring and connections",
            "Install surge protection devices",
            "Update maintenance protocol"
        ]
    ),
    
    "bypass-diode_failure": DefectInfo(
        className="Bypass Diode Failure",
        stressFactors=["Electrical", "Temperature"],
        priorityLevel="High",
        powerLoss="30-40%",
        category="Component",
        CoA="Diode Malfunction",
        description="Failure of bypass diodes that normally protect solar cells from hot spots and reverse current flow.",
        recommendations=[
            "Replace failed bypass diodes",
            "Check junction box integrity",
            "Thermal imaging inspection",
            "Verify string configuration",
            "Monitor voltage characteristics",
            "Professional repair required"
        ]
    )
}

def get_defect_info(class_name):
    """Get detailed information about a specific defect class"""
    return DEFECT_CLASSES.get(class_name.lower())