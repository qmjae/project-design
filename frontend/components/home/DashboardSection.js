import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PieChart } from 'react-native-chart-kit';
import { useGlobalContext } from '../../../backend/context/GlobalProvider';
import { getDefectHistory } from '../../../backend/lib/appwrite';
import { colors, shadows, borderRadius } from '../../styles/globalStyles';

// Add class name mapping
const classNameMapping = {
  'substring': 'Bypass Diode Failure',
  'short-circuit': 'Short Circuit',
  'open-circuit': 'Open Circuit',
  'single-cell': 'Single Cell'
};

// Function to get display name
const getDisplayName = (className) => {
  if (!className) return 'Unknown';
  return classNameMapping[className.toLowerCase()] || className;
};

const screenWidth = Dimensions.get('window').width - 40;

export default function DashboardSection() {
  const navigation = useNavigation();
  const { notifications, user } = useGlobalContext();
  const [defectHistory, setDefectHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch defect history from database on component mount
  useEffect(() => {
    const fetchDefectData = async () => {
      if (!user || !user.$id) return;
      
      try {
        const history = await getDefectHistory(user.$id);
        setDefectHistory(history);
      } catch (error) {
        console.error('Error fetching defect history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDefectData();
  }, [user]);

  // Calculate stats from notifications and database history
  const statsData = React.useMemo(() => {
    // Combine notifications with defect history for more comprehensive data
    const combinedData = [...notifications];
    
    // Check if defectHistory exists before processing
    if (defectHistory && defectHistory.length > 0) {
      // Add items from defect history that aren't already in notifications
      defectHistory.forEach(historyItem => {
        // Check if this defect is already in notifications
        const exists = notifications.some(n => 
          n.id === historyItem.$id
        );
        
        if (!exists) {
          // Check for the status field using the correct enum values
          const isResolved = historyItem.status === 'resolved';
          
          combinedData.push({
            id: historyItem.$id,
            type: isResolved ? 'Resolved' : 'Detected', // Use the enum status
            datetime: historyItem.DateTime,
            priority: historyItem.priority,
            name: historyItem.fileName,
            file: [{
              detections: [{ 
                class: historyItem.defectClass,
                priority: historyItem.priority
              }],
              fileName: historyItem.fileName,
              imageUrl: historyItem.imageUrl
            }]
          });
        }
      });
    }
    
    const totalDefects = combinedData.length;
    // Instead of just checking n.type === 'Resolved'
    const resolvedDefects = combinedData.filter(n => {
          // For notifications, check the type
          if (n.type === 'Resolved') return true;
          
          // For history items, check the status field
          if (n.status === 'resolved') return true;
          
          return false;
        }).length;
    const pendingDefects = totalDefects - resolvedDefects;
    
    // Determine most common defect type
    const defectTypes = {};
    combinedData.forEach(notification => {
      if (notification.file && notification.file[0]?.detections) {
        notification.file[0].detections.forEach(detection => {
          // Use the display name instead of the raw class name
          const defectClass = getDisplayName(detection.class) || 'Unknown';
          defectTypes[defectClass] = (defectTypes[defectClass] || 0) + 1;
        });
      }
    });
    
    let mostCommonDefect = 'None';
    let maxCount = 0;
    
    Object.keys(defectTypes).forEach(type => {
      if (defectTypes[type] > maxCount) {
        maxCount = defectTypes[type];
        mostCommonDefect = type;
      }
    });
    
    const resolvedPercentage = totalDefects ? Math.round((resolvedDefects / totalDefects) * 100) : 0;

    // Prepare data for pie chart
    const pieData = Object.keys(defectTypes).map((type, index) => {
      // Use different colors for each defect type
      const colorOptions = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
      return {
        name: type, // This is already using the mapped display name
        count: defectTypes[type],
        color: colorOptions[index % colorOptions.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      };
    });

    // If no data, add a placeholder
    if (pieData.length === 0) {
      pieData.push({
        name: 'No defects',
        count: 1,
        color: '#CCCCCC',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      });
    }

    // Get dates for line chart (last 7 days)
    const dates = [];
    const defectCounts = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = `${date.getMonth() + 1}/${date.getDate()}`;
      dates.push(dateString);
      
      // Count defects for this date
      const count = combinedData.filter(n => {
        const notifDate = new Date(n.datetime);
        return notifDate.getDate() === date.getDate() && 
               notifDate.getMonth() === date.getMonth() &&
               notifDate.getFullYear() === date.getFullYear();
      }).length;
      
      defectCounts.push(count);
    }
    
    return {
      totalDefects,
      resolvedDefects,
      pendingDefects,
      mostCommonDefect,
      resolvedPercentage,
      pieData,
      lineChartData: {
        labels: dates,
        datasets: [{ data: defectCounts }]
      }
    };
  }, [notifications, defectHistory]);

  const navigateToDefectHistory = () => navigation.navigate('DefectHistory');
  const navigateToNotifications = () => navigation.navigate('Notifications');

  if (loading) {
    return (
      <View style={[styles.dashboardContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.dashboardContainer}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="analytics-outline" size={28} color={colors.primary} />
          <Text style={styles.statNumber}>{statsData.totalDefects}</Text>
          <Text style={styles.statLabel}>Total Defects</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={28} color="#4CAF50" />
          <Text style={styles.statNumber}>{statsData.resolvedDefects}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="alert-circle-outline" size={28} color="#FFCC00" />
          <Text style={styles.statNumber}>{statsData.pendingDefects}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Defect Type Distribution - Pie Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Defect Type Distribution</Text>
        <PieChart
          data={statsData.pieData}
          width={screenWidth}
          height={200}
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: "#ffffff",
            backgroundGradientToOpacity: 0.5,
            color: (opacity = 1) => `rgba(118, 192, 223, ${opacity})`,
            strokeWidth: 2,
            barPercentage: 0.5,
            useShadowColorFromDataset: false
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          doughnut={true}
        />
      </View>
      
      {/* Most Common Defect */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.cardTitle}>Most Common Defect</Text>
        </View>
        <Text style={styles.infoCardContent}>{statsData.mostCommonDefect}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dashboardContainer: {
    padding: 15,
    paddingBottom: 95, // Add extra padding at bottom for navigation bar
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: 10,
    color: colors.text.medium,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.m,
    padding: 15,
    alignItems: 'center',
    width: '31%',
    ...shadows.strong,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.dark,
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.medium,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.m,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    ...shadows.medium,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.dark,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  completionCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.m,
    padding: 15,
    marginBottom: 15,
    ...shadows.light,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.dark,
  },
  percentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.m,
    padding: 15,
    marginBottom: 20,
    ...shadows.light,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoCardContent: {
    fontSize: 16,
    color: colors.text.dark,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: borderRadius.m,
    width: '48%',
    ...shadows.light,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  }
});