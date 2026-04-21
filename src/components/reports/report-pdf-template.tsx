'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

/**
 * Register the Kenao font for the signature 'A' logo.
 * Using a relative URL to ensure compatibility across development and production environments.
 */
Font.register({
  family: 'Kenao',
  src: '/api/font',
});

const styles = StyleSheet.create({
  page: {
    padding: 70,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 60,
  },
  logoMark: {
    width: 48,
    height: 48,
    backgroundColor: '#FF764D',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'Kenao',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  recordType: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
  },
  studentSection: {
    marginBottom: 50,
  },
  studentName: {
    fontSize: 42,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -1.2,
  },
  metaGrid: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 25,
    borderTop: 1,
    borderColor: '#f1f5f9',
    gap: 50,
  },
  metaItem: {
    flexDirection: 'column',
  },
  metaLabel: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  metaValue: {
    fontSize: 12,
    color: '#111827',
    fontFamily: 'Helvetica-Bold',
  },
  sectionHeader: {
    fontSize: 12,
    color: '#FF764D',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginTop: 40,
    marginBottom: 20,
  },
  gradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gradeCard: {
    width: '48.5%',
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  criterionText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
  },
  levelText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#FF764D',
  },
  briefContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 118, 77, 0.03)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 118, 77, 0.1)',
    marginBottom: 20,
  },
  briefText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#64748b',
    fontStyle: 'italic',
  },
  narrativeContainer: {
    padding: 25,
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  narrativeText: {
    fontSize: 13,
    lineHeight: 1.7,
    color: '#475569',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 70,
    right: 70,
    textAlign: 'center',
    borderTop: 1,
    borderColor: '#f1f5f9',
    paddingTop: 25,
  },
  footerText: {
    fontSize: 8.5,
    color: '#cbd5e1',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
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
  aiOutput?: string;
  documentId: string;
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
  teacherFeedback,
  aiOutput,
  documentId
}: ReportPDFTemplateProps) {
  return (
    <Document title={`Academic Report - ${studentName}`}>
      <Page size="A4" style={styles.page}>
        {/* Modern Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>A</Text>
          </View>
          <Text style={styles.recordType}>Academic Report</Text>
        </View>

        {/* Student Record Identification */}
        <View style={styles.studentSection}>
          <Text style={styles.studentName}>{studentName}</Text>
          
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Assignment</Text>
              <Text style={styles.metaValue}>{assignmentTitle}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Date Issued</Text>
              <Text style={styles.metaValue}>{date}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Document ID</Text>
              <Text style={styles.metaValue}>{documentId}</Text>
            </View>
          </View>
        </View>

        {/* Evaluation Summary */}
        <View>
          <Text style={styles.sectionHeader}>Proficiency Breakdown</Text>
          <View style={styles.gradesGrid}>
            {rubricGrades.map((grade, index) => (
              <View key={index} style={styles.gradeCard}>
                <Text style={styles.criterionText}>{grade.criterionName}</Text>
                <Text style={styles.levelText}>Level {formatProficiencyLevel(normalizeScore(grade.score, grade.maxScore))}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Original Analysis (Document Background) */}
        {aiOutput && (
            <View>
                <Text style={styles.sectionHeader}>AI Intelligence Brief</Text>
                <View style={styles.briefContainer}>
                    <Text style={styles.briefText}>{aiOutput}</Text>
                </View>
            </View>
        )}

        {/* Qualitative Commentary */}
        <View>
          <Text style={styles.sectionHeader}>Teacher Narrative</Text>
          <View style={styles.narrativeContainer}>
            <Text style={styles.narrativeText}>
              {teacherFeedback ? `"${teacherFeedback}"` : 'No additional narrative provided for this academic record.'}
            </Text>
          </View>
        </View>

        {/* Official Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated via Athena Assessment Systems • Official Student Progress Record
          </Text>
        </View>
      </Page>
    </Document>
  );
}
