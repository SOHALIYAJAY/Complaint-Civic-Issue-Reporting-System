from rest_framework.views import APIView
from rest_framework.response import Response
from complaints.models import Complaint

class DistrictDetailView(APIView):
    def get(self, request, district_name):
        # District static data

        gujarat_districts = {
            "Ahmedabad":        {"area": "8,107 km²", "population": "7,214,225", "hq": "Ahmedabad", "villages": None},
            "Amreli":           {"area": "7,397 km²", "population": "1,514,190", "hq": "Amreli", "villages": None},
            "Anand":            {"area": "3,204 km²", "population": "2,090,276", "hq": "Anand", "villages": None},
            "Aravalli":         {"area": "3,217 km²", "population": "1,039,918", "hq": "Modasa", "villages": None},
            "Banaskantha":      {"area": "6,176 km²", "population": "3,120,506", "hq": "Palanpur", "villages": None},
            "Bharuch":          {"area": "6,524 km²", "population": "1,550,822", "hq": "Bharuch", "villages": None},
            "Bhavnagar":        {"area": "8,155 km²", "population": "2,880,365", "hq": "Bhavnagar", "villages": None},
            "Botad":            {"area": "2,564 km²", "population": "656,005", "hq": "Botad", "villages": None},
            "Chhota Udaipur":   {"area": "3,436 km²", "population": "1,071,831", "hq": "Chhota Udaipur", "villages": None},
            "Dahod":            {"area": "3,642 km²", "population": "2,126,558", "hq": "Dahod", "villages": None},
            "Dang":             {"area": "1,764 km²", "population": "228,291", "hq": "Ahwa", "villages": None},
            "Devbhoomi Dwarka": {"area": "4,051 km²", "population": "752,484", "hq": "Dwarka", "villages": None},
            "Gandhinagar":      {"area": "2,163 km²", "population": "1,391,753", "hq": "Gandhinagar", "villages": None},
            "Gir Somnath":      {"area": "3,754 km²", "population": "1,217,477", "hq": "Veraval", "villages": None},
            "Jamnagar":         {"area": "14,184 km²", "population": "2,160,119", "hq": "Jamnagar", "villages": None},
            "Junagadh":         {"area": "5,092 km²", "population": "2,743,082", "hq": "Junagadh", "villages": None},
            "Kachchh":          {"area": "45,674 km²", "population": "2,092,371", "hq": "Bhuj", "villages": None},
            "Kheda":            {"area": "3,667 km²", "population": "2,299,885", "hq": "Nadiad", "villages": None},
            "Mahisagar":        {"area": "2,500 km²", "population": "994,624", "hq": "Lunawada", "villages": None},
            "Mehsana":          {"area": "4,386 km²", "population": "2,027,727", "hq": "Mehsana", "villages": None},
            "Morbi":            {"area": "4,871 km²", "population": "960,329", "hq": "Morbi", "villages": None},
            "Narmada":          {"area": "2,817 km²", "population": "590,297", "hq": "Rajpipla", "villages": None},
            "Navsari":          {"area": "2,246 km²", "population": "1,329,672", "hq": "Navsari", "villages": None},
            "Palanpur":         {"area": None, "population": None, "hq": None, "villages": None},  # Not a district but HQ in Banaskantha
            "Patan":            {"area": "5,792 km²", "population": "1,343,734", "hq": "Patan", "villages": None},
            "Porbandar":        {"area": "2,316 km²", "population": "586,062", "hq": "Porbandar", "villages": None},
            "Rajkot":           {"area": "11,203 km²", "population": "3,804,558", "hq": "Rajkot", "villages": None},
            "Sabarkantha":      {"area": "5,390 km²", "population": "2,428,589", "hq": "Himatnagar", "villages": None},
            "Surat":            {"area": "4,549 km²", "population": "6,081,322", "hq": "Surat", "villages": None},
            "Surendranagar":    {"area": "10,423 km²", "population": "1,756,268", "hq": "Surendranagar", "villages": None},
            "Tapi":             {"area": "3,139 km²", "population": "807,022", "hq": "Vyara", "villages": None},
            "Valsad":           {"area": "3,008 km²", "population": "1,705,678", "hq": "Valsad", "villages": None},
            "Vadodara":         {"area": "4,549 km²", "population": "6,081,322", "hq": "Vadodara", "villages": None},
            "Vav-Tharad":       {"area": "6,257 km²", "population": "1,380,870", "hq": "Tharad", "villages": None}
        }

        
        # Get complaint statistics for the district
        total_complaints = Complaint.objects.filter(location_District=district_name).count()
        resolved_complaints = Complaint.objects.filter(location_District=district_name, status='resolved').count()
        pending_complaints = Complaint.objects.filter(location_District=district_name, status='Pending').count()
        inprogress_complaints = Complaint.objects.filter(location_District=district_name, status='in-progress').count()
        
        # Calculate SLA Compliance
        sla_compliance = (resolved_complaints / total_complaints * 100) if total_complaints > 0 else 0
        
        # Get district info or use defaults
        info = district_info.get(district_name, {
            'area': 'N/A',
            'population': 'N/A',
            'hq': district_name,
            'villages': 0
        })
        
        return Response({
            'name': district_name,
            'area': info['area'],
            'population': info['population'],
            'hq': info['hq'],
            'villages': info['villages'],
            'total_complaints': total_complaints,
            'resolved_complaints': resolved_complaints,
            'pending_complaints': pending_complaints,
            'inprogress_complaints': inprogress_complaints,
            'sla_compliance': sla_compliance
        })