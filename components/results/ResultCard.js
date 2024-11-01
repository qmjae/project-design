import React, { memo } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ThermalImage } from './ThermalImage';
import { ModuleInfo } from './ModuleInfo';
import { DetailRow } from './DetailRow';
import { Section } from './Section';

export const ResultCard = memo(({ item, width }) => (
  <View style={[styles.resultCard, { width }]}>
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <ThermalImage imageUri={item.imageUri} />
      
      <View style={styles.contentContainer}>
        <ModuleInfo />

        <View style={styles.detailsContainer}>
          <DetailRow label="Stress factors" value="Lorem Ipsum" />
          <DetailRow label="Priority Level" value="Lorem Ipsum" />
          <DetailRow label="Power Loss" value="Lorem Ipsum" />
          <DetailRow label="Category" value="Lorem Ipsum" />
          <DetailRow label="CoA" value="Lorem Ipsum" />

          <Section 
            title="Description"
            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
          />

          <Section 
            title="Recommendation"
            content="
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            "
          />
        </View>
      </View>
    </ScrollView>

    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.resolvedButton}>
        <Text style={styles.resolvedButtonText}>Resolve</Text>
      </TouchableOpacity>
    </View>
  </View>
));

const styles = StyleSheet.create({
  resultCard: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#F0F0F0',
    borderRadius: 15,
    padding: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    height: "98%",
  },
  contentContainer: {
    flexGrow: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  detailsContainer: {
    flex: 1,
    marginBottom: 0,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 15,
    right: 12,
    backgroundColor: 'white',
  },
  resolvedButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resolvedButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 