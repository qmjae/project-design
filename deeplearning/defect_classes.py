class DefectInfo:
    def __init__(self, className, stressFactors, severityLevel, powerLoss, category, CoA, description, recommendations):
        self.className = className
        self.stressFactors = stressFactors
        self.severityLevel = severityLevel
        self.powerLoss = powerLoss
        self.category = category
        self.CoA = CoA  # Classes of Abnormalities
        self.description = description
        self.recommendations = recommendations

# Define all defect classes
DEFECT_CLASSES = {
    #DONE
    "short-circuit": DefectInfo(
        className="Short Circuit",
        stressFactors=["Thermal Cycling", "Mechanical Load"], #TSANAKAS
        severityLevel="9 - Hazardous",
        powerLoss="No energy output",
        category="IEC TS 62446-3: Strings and modules",
        CoA="2: thermal abnormality – tA",
        description="Assessable by thermal pattern, visual image and classified as a extended area abnormality. Similar pattern as with broken front glass (check isolation resistance), PID, cell defects and mismatch. ",
        recommendations=[
            "Check module and cabling."
        ]
    ),
    #DONE
        "open-circuit": DefectInfo(
        className="Open Circuit", 
        stressFactors=["Bad wiring between module and junction box"], #TSANAKAS
        severityLevel="9 - Hazardous", #FMEA
        powerLoss="No energy output", #FMEA
        category="IEC TS 62446-3: Strings and modules", #IEC
        CoA="2: thermal abnormality – tA", #IEC
        description="Assessable by thermal pattern, visual image and classified as a extended area abnormality.The module surface is homogeneously heated. ∆T of the junction box is similar to operational state.  ",
        recommendations=[
            "Check module, state of operation of inverter, and condition of cabling, connectors, and fuses."
        ]
    ),
    #DONE
        "single-cell": DefectInfo(
        className="Single Cell",
        stressFactors=["Temperature", "UV"], #DONE #TSANAKAS
        severityLevel="7 - High", #DONE
        powerLoss="High", #DONE
        category="IEC TS 62446-3:  Local abnormalities", #DONE
        CoA="2: thermal abnormality or tA or 3: safety relevant thermal abnormality – dtA", #DONE
        description="Assessable by thermal pattern, visual image and classified as an extended area abnormality. Difference in temperature increases with load, cell efficiency and number of cells in a substring. High temperatures mostly caused by broken cells. Might lead to irreversible damage of cell, encapsulation and bypass diodes.",
        recommendations=[
            "Check that there is no shading or severe soiling."
        ]
    )
}

def get_defect_info(class_name):
    """Get detailed information about a specific defect class"""
    return DEFECT_CLASSES.get(class_name.lower())