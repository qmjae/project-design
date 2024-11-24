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
    "partial-shading": DefectInfo(
        className="Partial Shading",
        stressFactors=["N/A"],
        severityLevel="5 - Moderate",
        powerLoss="~10%-20% reduction",
        category="IEC TS 62446-3: Local abnormalities",
        CoA="2: thermal abnormality – tA",
        description="Assessable by thermal pattern, visual image and classified typically as an extended area abnormality. ",
        recommendations=[
            "Cleaning of PV modules is highly recommended in near future to avoid damage of PV module, proper care can significantly minimize the probability of partial shading and new shading elements",
        ]
    ),
    #DONE
    "short-circuit": DefectInfo(
        className="Short Circuit",
        stressFactors=["Thermal Cycling", "Mechanical Load"],
        severityLevel="9 - Hazardous",
        powerLoss="No power output, unsafe for maintenance",
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
        powerLoss="No power output", #FMEA
        category="IEC TS 62446-3: Strings and modules", #IEC
        CoA="2: thermal abnormality – tA", #IEC
        description="Assessable by thermal pattern, visual image and classified as a extended area abnormality.The module surface is homogeneously heated. ∆T of the junction box is similar to operational state.  ",
        recommendations=[
            "Check module, state of operation of inverter, and condition of cabling, connectors, and fuses."
        ]
    ),
    #DONE
    "substring": DefectInfo(
        className="Bypass Diode Failure",
        stressFactors=["Electrical"], #DONE
        severityLevel="7 - High", #DONE
        powerLoss=">50% reduction", #DONE
        category="IEC TS 62446-3:  Substrings within module", #DONE
        CoA="2: thermal abnormality – tA", #DONE
        description="Assessable by thermal pattern and classified as  a extended area abnormality.  At one or more substrings, easily mistaken for cell breakage or cell defects, Potential induced degradation (PID) or mismatch.", #DONE
        recommendations=[
            "Check module and bypass diodes for proper function under reverse biasing.", #DONE
        ]
    ),
    #DONE
        "single-cell": DefectInfo(
        className="Single Cell",
        stressFactors=["Temperature", "UV"], #DONE
        severityLevel="7 - High", #DONE
        powerLoss=">50% reduction", #DONE
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