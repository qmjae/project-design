import React, { useEffect, useState } from 'react';
import { View, FlatList, SafeAreaView, Image, Text, ScrollView } from 'react-native';
import { HeaderHistory } from '../components/history/HeaderHistory';
import { HistoryCard } from '../components/history/HistoryCard';
import { useGlobalContext } from '../../backend/context/GlobalProvider';
import { getDefectHistory } from '../../backend/lib/appwrite';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import ActionButtons from '../components/home/ActionButtons';
import { globalStyles, colors, borderRadius, shadows } from '../styles/globalStyles';

export default function DefectHistoryScreen({ navigation, route }) {
  const { notificationId, fileName } = route.params || {}
  const [defectHistory, setDefectHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const { user } = useGlobalContext();

  useEffect(() => {
    fetchDefectHistory();
  }, []);

  const fetchDefectHistory = async () => {
    try {
      const history = await getDefectHistory(user.$id);
      setDefectHistory(history);
      // Check if coming from notification
      if (notificationId && fileName) {
        const matchedDefects = history.filter((item) => item.fileName === fileName);
        if (matchedDefects.length > 0) {
          matchedDefects.sort((a, b) => new Date(b.DateTime) - new Date(a.DateTime));
          setSelectedDefect(matchedDefects[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching defect history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOnBack = () => {
    if (notificationId && fileName) {
      navigation.navigate('Home');
    } else {
      setSelectedDefect(null);
    }
  };

  const renderItem = ({ item }) => (
    <HistoryCard 
      defect={item}
      onPress={() => setSelectedDefect(item)}
    />
  );

  if (selectedDefect) {
    return (
      <BackgroundWrapper>
        <SafeAreaView style={globalStyles.safeArea}>
          <View style={[globalStyles.container, styles.containerPadding]}>
            <HeaderHistory 
              onBack={handleOnBack}
              title={selectedDefect.defectClass || 'Defect Details'} 
            />
            <ScrollView style={styles.content}>
              {selectedDefect.imageUrl && (
                <Image
                  source={{ uri: selectedDefect.imageUrl }}
                  style={styles.image}
                  resizeMode="contain"
                />
              )}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Defect Type:</Text>
                  <Text style={styles.value}>{selectedDefect.defectClass || 'Unknown'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Severity:</Text>
                  <Text style={[
                    styles.value, 
                    styles.priority,
                  ]}>
                    {selectedDefect.priority || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>{formatDate(selectedDefect.DateTime)}</Text>
                </View>
                {selectedDefect.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.description}>{selectedDefect.description}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
          <ActionButtons navigation={navigation} currentScreen="DefectHistory" />
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
        <View style={[globalStyles.container]}>
          <HeaderHistory />
          <FlatList
            data={defectHistory}
            renderItem={renderItem}
            keyExtractor={item => item.$id}
            contentContainerStyle={globalStyles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <ActionButtons navigation={navigation} currentScreen="DefectHistory" />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = {
  // containerPadding: {
  //   padding: 15,
  // },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.m,
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.m,
    padding: 15,
    ...shadows.light,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.dark,
  },
  value: {
    fontSize: 16,
    color: colors.text.medium,
  },
  priority: {
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: colors.text.medium,
    marginTop: 5,
    lineHeight: 24,
  },
};