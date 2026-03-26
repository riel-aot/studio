'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Note: Standard fonts are used for maximum reliability without extra loading overhead
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  headerBar: {
    height: 4,
    backgroundColor: '#FF764D', // Athena Primary
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF764D',
    letterSpacing: 1,
  },
  recordLabel: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  summaryBlock: {
    marginBottom: 30,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  assignmentTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  metaGrid: {
    flexDirection: 'row',
    marginTop: 10,
    borderTop: 1,
    borderBottom: 1,
    borderColor: '#f1f5f9',
    paddingVertical: 10,
  },
  metaItem: {
    marginRight: 30,
  },
  metaLabel: {
    fontSize: 7,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    color: '#111827',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 10,
    color: '#FF764D',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 25,
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  scoreCard: {
    width: '48%',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  criterionName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  scoreBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF764D',
  },
  narrativeBox: {
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginTop: 5,
  },
  narrativeText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#334155',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: 1,
    borderColor: '#f1f5f9',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  }
});

interface ReportPDFTemplateProps {
  studentName: string;
  assignmentTitle: string;
  date: string;
  rubricGrades: Array<{
    criterionName: string;
    score: number;
    maxScore: number;
  }>;
  teacherFeedback: string;
}

const formatProficiencyLevel = (score: number): string => {
  const rounded = Math.max(1, Math.min(8, Math.round(Number(score))));
  switch (rounded) {
    case 1: return 'A';
    case 2: return 'B';
    case 3: return '1';
    case 4: return '2';
    case 5: return '3';
    case 6: return '4';
    case 7: return '5';
    case 8: return '6';
    default: return '3';
  }
};

const normalizeScore = (score: number, maxScore?: number): number => {
    if (maxScore === 6) return score + 2;
    return score;
};

export function ReportPDFTemplate({ 
  studentName, 
  assignmentTitle, 
  date, 
  rubricGrades, 
  teacherFeedback 
}: ReportPDFTemplateProps) {
  return (
    <Document title={`Report - ${studentName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        
        <View style={styles.brandRow}>
          <Text style={styles.brandName}>ATHΞNA</Text>
          <Text style={styles.recordLabel}>Official Academic Record</Text>
        </View>

        <View style={styles.summaryBlock}>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.assignmentTitle}>{assignmentTitle}</Text>
          
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Issue Date</Text>
              <Text style={styles.metaValue}>{date}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Record Type</Text>
              <Text style={styles.metaValue}>Finalized Assessment</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Academic Achievement</Text>
        <View style={styles.gridContainer}>
          {rubricGrades.map((grade, index) => (
            <View key={index} style={styles.scoreCard}>
              <Text style={styles.criterionName}>{grade.criterionName}</Text>
              <Text style={styles.scoreBadge}>Level {formatProficiencyLevel(normalizeScore(grade.score, grade.maxScore))}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Teacher Narrative Feedback</Text>
        <View style={styles.narrativeBox}>
          <Text style={styles.narrativeText}>
            "{teacherFeedback || 'No additional narrative provided.'}"
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Athena Education Platform | This report is an official academic summary generated for parent review.
          </Text>
        </View>
      </Page>
    </Document>
  );
}