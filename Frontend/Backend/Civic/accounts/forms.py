from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from .models import CustomUser


class CustomUserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Confirm Password", widget=forms.PasswordInput)
    User_Role = forms.ChoiceField(
        choices=CustomUser.CHOICE_FIELDS,
        widget=forms.Select(attrs={'class': 'form-control'}),
        initial='Civic-User'
    )

    class Meta:
        model = CustomUser
        fields = ("email", "username", "name", "User_Role", "mobile_number", "address", "district", "taluka", "ward_number")

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords do not match")

        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class CustomUserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField()
    User_Role = forms.ChoiceField(
        choices=CustomUser.CHOICE_FIELDS,
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = CustomUser
        fields = ("email", "username", "name", "User_Role", "mobile_number", "address", "district", "taluka", "ward_number", "password", "is_active", "is_staff")

    def clean_password(self):
        return self.initial["password"]