'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  headerBar: {
    height: 3,
    backgroundColor: '#FF764D',
    marginBottom: 30,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#FF764D',
    letterSpacing: -1,
  },
  xiContainer: {
    width: 18,
    height: 14,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginHorizontal: 3,
    marginTop: 4,
  },
  xiBar: {
    height: 3,
    backgroundColor: '#FF764D',
    borderRadius: 1.5,
  },
  recordLabel: {
    fontSize: 8,
    color: '#94a3b8',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    paddingBottom: 4,
  },
  summaryBlock: {
    marginBottom: 40,
  },
  studentName: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  assignmentTitle: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 25,
  },
  metaGrid: {
    flexDirection: 'row',
    borderTop: 1,
    borderBottom: 1,
    borderColor: '#f1f5f9',
    paddingVertical: 20,
    gap: 50,
  },
  metaItem: {
    flexDirection: 'column',
  },
  metaLabel: {
    fontSize: 7,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    letterSpacing: 1.2,
  },
  metaValue: {
    fontSize: 10,
    color: '#111827',
    fontFamily: 'Helvetica-Bold',
  },
  sectionTitle: {
    fontSize: 10,
    color: '#FF764D',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 40,
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  scoreCard: {
    width: '48.5%',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  criterionName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
  },
  scoreBadge: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#FF764D',
  },
  narrativeBox: {
    padding: 25,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  narrativeText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#475569',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    textAlign: 'center',
    borderTop: 1,
    borderColor: '#f1f5f9',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 8,
    color: '#cbd5e1',
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

        <View>
          <Text style={styles.sectionTitle}>Academic Achievement</Text>
          <View style={styles.gridContainer}>
            {rubricGrades.map((grade, index) => (
              <View key={index} style={styles.scoreCard}>
                <Text style={styles.criterionName}>{grade.criterionName}</Text>
                <Text style={styles.scoreBadge}>Level {formatProficiencyLevel(normalizeScore(grade.score, grade.maxScore))}</Text>
              </View>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Teacher Narrative Feedback</Text>
          <View style={styles.narrativeBox}>
            <Text style={styles.narrativeText}>
              {teacherFeedback ? `"${teacherFeedback}"` : 'No additional narrative provided for this record.'}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            &copy; 2026 Athena Education Platform | Generated via ATHΞNA Assessment Systems
          </Text>
        </View>
      </Page>
    </Document>
  );
}
