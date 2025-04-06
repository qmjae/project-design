import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGlobalContext } from '../../../backend/context/GlobalProvider';
import { colors, shadows, borderRadius } from '../../styles/globalStyles';

export default function DashboardSection() {
  const navigation = useNavigation();
  const { notifications, user } = useGlobalContext();

  // Calculate stats from notifications
  const statsData = React.useMemo(() => {
    const totalDefects = notifications.length;
    const resolvedDefects = notifications.filter(n => n.type === 'Resolved').length;
    const pendingDefects = totalDefects - resolvedDefects;
    
    // Determine most common defect type
    const defectTypes = {};
    notifications.forEach(notification => {
      if (notification.file && notification.file[0]?.detections) {
        notification.file[0].detections.forEach(detection => {
          const defectClass = detection.class || 'Unknown';
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
    
    return {
      totalDefects,
      resolvedDefects,
      pendingDefects,
      mostCommonDefect: mostCommonDefect.charAt(0).toUpperCase() + mostCommonDefect.slice(1).replace('-', ' '),
      resolvedPercentage
    };
  }, [notifications]);

  const navigateToDefectHistory = () => navigation.navigate('DefectHistory');
  const navigateToNotifications = () => navigation.navigate('Notifications');

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
      
      {/* Completion Rate */}
      <View style={styles.completionCard}>
        <View style={styles.completionHeader}>
          <Text style={styles.cardTitle}>Resolution Rate</Text>
          <Text style={styles.percentage}>{statsData.resolvedPercentage}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              {width: `${statsData.resolvedPercentage}%`}
            ]} 
          />
        </View>
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
  },
});