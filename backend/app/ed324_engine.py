# ED-324 Requirement Engine
# Maps workflow steps to ED-324 requirements and detects gaps

ED324_REQUIREMENTS = {
    "data_preparation": {
        "requirement": "Training data preparation and validation",
        "details": "Document data sources, preprocessing, versioning, and validation approach",
        "ambiguous": False
    },
    "model_training": {
        "requirement": "Model training process and hyperparameter selection",
        "details": "Describe training procedure, hyperparameter tuning, reproducibility measures",
        "ambiguous": False
    },
    "testing_evaluation": {
        "requirement": "Model testing and evaluation (accuracy, robustness, edge cases)",
        "details": "Test coverage, metrics, adversarial testing, failure modes",
        "ambiguous": False
    },
    "robustness_validation": {
        "requirement": "Robustness validation across operational conditions",
        "details": "Weather conditions, sensor degradation, out-of-distribution inputs",
        "ambiguous": True,
        "interpretations": [
            {
                "id": "statistical",
                "label": "Statistical testing on out-of-distribution data",
                "description": "Quantitative validation showing model performance on data outside training distribution"
            },
            {
                "id": "adversarial",
                "label": "Adversarial attack testing (e.g., FGSM, PGD)",
                "description": "Testing model robustness against intentionally perturbed inputs"
            },
            {
                "id": "simulation",
                "label": "Simulation on edge case scenarios",
                "description": "Testing on synthetic edge cases (weather conditions, sensor failures, extreme values)"
            },
            {
                "id": "combinatorial",
                "label": "Combinatorial testing across operational bounds",
                "description": "Testing combinations of operational parameters (temperature ranges, sensor types, etc.)"
            }
        ]
    },
    "monitoring_deployment": {
        "requirement": "Deployment monitoring and performance tracking",
        "details": "Runtime metrics, drift detection, performance bounds",
        "ambiguous": False
    },
    "requirements_traceability": {
        "requirement": "Traceability from requirements to training data to model",
        "details": "Requirements mapping, data provenance, model versioning",
        "ambiguous": False
    },
    "documentation": {
        "requirement": "Comprehensive development and certification documentation",
        "details": "Process documentation, design rationale, evidence artifacts",
        "ambiguous": False
    }
}

class ED324Engine:
    """Map workflow steps to ED-324 requirements and detect gaps."""

    def __init__(self):
        self.requirements = ED324_REQUIREMENTS

    def map_workflow(self, workflow_steps):
        """
        Map user's workflow steps to ED-324 requirements.

        Args:
            workflow_steps: List of dicts with 'name', 'description', 'tools'

        Returns:
            dict with 'mapping' (step -> requirements) and 'coverage' (%)
        """
        mapping = {}
        covered_reqs = set()

        for step in workflow_steps:
            step_name = step.get('name', '').lower()
            description = step.get('description', '').lower()

            matched_reqs = []
            for req_id, req_data in self.requirements.items():
                if self._matches_requirement(step_name, description, req_id, req_data):
                    matched_reqs.append(req_id)
                    covered_reqs.add(req_id)

            mapping[step.get('name')] = matched_reqs

        coverage = len(covered_reqs) / len(self.requirements) * 100
        return {
            'mapping': mapping,
            'covered_requirements': list(covered_reqs),
            'coverage_percent': round(coverage, 1)
        }

    def detect_gaps(self, mapping):
        """Detect which ED-324 requirements are not covered by workflow."""
        covered = set(mapping.get('covered_requirements', []))
        all_reqs = set(self.requirements.keys())
        gaps = all_reqs - covered

        return {
            'missing_requirements': list(gaps),
            'gap_details': [
                {
                    'requirement': self.requirements[gap]['requirement'],
                    'details': self.requirements[gap]['details']
                }
                for gap in gaps
            ],
            'gap_count': len(gaps)
        }

    def get_ambiguous_requirements(self):
        """Return list of requirements with multiple interpretations."""
        ambiguous = {}
        for req_id, req_data in self.requirements.items():
            if req_data.get('ambiguous'):
                ambiguous[req_id] = {
                    'requirement': req_data['requirement'],
                    'details': req_data['details'],
                    'interpretations': req_data.get('interpretations', [])
                }
        return ambiguous

    def _matches_requirement(self, step_name, description, req_id, req_data):
        """Simple keyword matching to map steps to requirements."""
        keywords = {
            'data_preparation': ['data', 'training', 'dataset', 'prepare', 'preprocess'],
            'model_training': ['train', 'model', 'hyperparameter', 'learning'],
            'testing_evaluation': ['test', 'evaluate', 'metric', 'accuracy', 'performance'],
            'robustness_validation': ['robust', 'adversarial', 'weather', 'edge case', 'validation'],
            'monitoring_deployment': ['monitor', 'deploy', 'drift', 'runtime', 'performance bound'],
            'requirements_traceability': ['trace', 'traceability', 'version', 'lineage', 'provenance'],
            'documentation': ['document', 'doc', 'evidence', 'artifact']
        }

        keywords_for_req = keywords.get(req_id, [])
        return any(kw in step_name or kw in description for kw in keywords_for_req)
