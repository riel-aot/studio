'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  headerBar: {
    height: 4,
    backgroundColor: '#FF764D',
    marginBottom: 25,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  brandText: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#FF764D',
    letterSpacing: -0.5,
  },
  xiContainer: {
    width: 15,
    height: 13,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginHorizontal: 2,
    paddingVertical: 1,
    marginTop: 2, // Fine-tuned baseline alignment
  },
  xiBar: {
    height: 2.2,
    backgroundColor: '#FF764D',
    borderRadius: 1,
  },
  recordLabel: {
    fontSize: 7,
    color: '#94a3b8',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  summaryBlock: {
    marginBottom: 40,
  },
  studentName: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  assignmentTitle: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaGrid: {
    flexDirection: 'row',
    marginTop: 20,
    borderTop: 1,
    borderBottom: 1,
    borderColor: '#f1f5f9',
    paddingVertical: 15,
  },
  metaItem: {
    marginRight: 40,
  },
  metaLabel: {
    fontSize: 6,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 9,
    color: '#111827',
    fontFamily: 'Helvetica-Bold',
  },
  sectionTitle: {
    fontSize: 9,
    color: '#FF764D',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 30,
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scoreCard: {
    width: '48%',
    padding: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  criterionName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  scoreBadge: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#FF764D',
  },
  narrativeBox: {
    padding: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
    paddingTop: 20,
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
    letterSpacing: 0.5,
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
    <Document title={`Academic Report - ${studentName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        
        <View style={styles.brandRow}>
          <View style={styles.logoContainer}>
            <Text style={styles.brandText}>ATH</Text>
            <View style={styles.xiContainer}>
              <View style={styles.xiBar} />
              <View style={styles.xiBar} />
              <View style={styles.xiBar} />
            </View>
            <Text style={styles.brandText}>NA</Text>
          </View>
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
            {teacherFeedback ? `"${teacherFeedback}"` : 'No additional narrative provided for this record.'}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            &copy; 2026 Athena Education Platform | This report is an official academic summary generated for parent review.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
