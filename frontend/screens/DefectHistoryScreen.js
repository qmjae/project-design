import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, Image, Text, ScrollView } from 'react-native';
import { HeaderHistory } from '../components/history/HeaderHistory';
import { HistoryCard } from '../components/history/HistoryCard';
import { useGlobalContext } from '../../backend/context/GlobalProvider';
import { getDefectHistory, databases } from '../../backend/lib/appwrite';
import BackgroundWrapper from '../components/common/BackgroundWrapper';

export default function DefectHistoryScreen({ navigation }) {
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

  const renderItem = ({ item }) => (
    <HistoryCard 
      defect={item}
      onPress={() => setSelectedDefect(item)}
    />
  );

  if (selectedDefect) {
    return (
      <BackgroundWrapper>
        <SafeAreaView style={styles.container}>
          <HeaderHistory 
            onBack={() => setSelectedDefect(null)} 
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
                <Text style={styles.label}>Priority:</Text>
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
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <HeaderHistory 
          onBack={() => navigation.navigate('Home')}
          title="History"
        />
        <FlatList
          data={defectHistory}
          renderItem={renderItem}
          keyExtractor={item => item.$id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  priority: {
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    lineHeight: 24,
  },
});
