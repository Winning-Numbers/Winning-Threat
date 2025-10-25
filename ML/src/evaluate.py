from sklearn.metrics import accuracy_score , classification_report , confusion_matrix

def eval_accuracy(x , y , model):
    return accuracy_score(y , model.predict(x))

def eval_classification_report(x , y , model):
    return classification_report(y , model.predict(x))

def eval_confusion_matrix(x , y , model):
    return confusion_matrix(y , model.predict(x))
