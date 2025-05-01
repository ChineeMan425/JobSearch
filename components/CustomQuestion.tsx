import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

interface QuestionItem {
    question: string;
    answer: string;
}

interface CustomQuestionsProps {
    questions: QuestionItem[];
    onAddQuestion: () => void;
    onRemoveQuestion: (index: number) => void;
    onQuestionChange: (text: string, index: number) => void;
    onAnswerChange: (text: string, index: number) => void;
}

const CustomQuestions: React.FC<CustomQuestionsProps> = ({
                                                             questions,
                                                             onAddQuestion,
                                                             onRemoveQuestion,
                                                             onQuestionChange,
                                                             onAnswerChange,
                                                         }) => {
    return (
        <View>
            <Text style={styles.label}>Custom Questions</Text>
            {questions.map((item, index) => (
                <View key={index} style={styles.questionAnswerContainer}>
                    <TextInput
                        style={styles.questionInput}
                        placeholder={`Question ${index + 1}`}
                        value={item.question}
                        onChangeText={(text) => onQuestionChange(text, index)}
                    />
                    <TextInput
                        style={styles.answerInput}
                        placeholder={`Expected Answer ${index + 1}`}
                        value={item.answer}
                        onChangeText={(text) => onAnswerChange(text, index)}
                    />
                    {questions.length > 1 && (
                        <TouchableOpacity onPress={() => onRemoveQuestion(index)} style={styles.removeButton}>
                            <Icon name="trash" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    )}
                </View>
            ))}
            <Button
                title="Add Another Question"
                onPress={onAddQuestion}
                buttonStyle={styles.addAnotherQuestionButton}
                titleStyle={styles.buttonText}
                containerStyle={{ marginTop: 10 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 16,
        marginBottom: 10,
        marginTop: 15,
        color: '#374151',
        fontFamily: 'Inter_600SemiBold',
    },
    questionAnswerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    questionInput: {
        flex: 2,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 5,
        backgroundColor: '#fff',
        marginRight: 10,
        fontFamily: 'Inter_400Regular',
    },
    answerInput: {
        flex: 2,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 5,
        backgroundColor: '#fff',
        fontFamily: 'Inter_400Regular',
    },
    removeButton: {
        padding: 8,
    },
    addAnotherQuestionButton: {
        backgroundColor: '#64748b',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
    },
});

export default CustomQuestions;