model {{model_name}}
  "Block that exchanges a vector of real values with CYMDIST"
  extends Modelica.Blocks.Interfaces.BlockIcon;
  
///////////// THE CODE BELOW HAS BEEN AUTOGENERATED //////////////   
  {%- for dict_item in scalar_variables %}
  {%- if (dict_item["causality"])== "parameter" %}
  parameter {{dict_item["vartype"]}} {{dict_item["name"]}}(unit="{{dict_item["unit"]}}") = {{dict_item["start"]}}
    "{{dict_item["description"]}}";
  {%- elif (dict_item["causality"])== "input" %}
  Modelica.Blocks.Interfaces.RealInput {{dict_item["name"]}}(start={{dict_item["start"]}}, unit="{{dict_item["unit"]}}")
    "{{dict_item["description"]}}"{{dict_item["annotation"]}};
  {%- elif (dict_item["causality"])== "output" %}
  Modelica.Blocks.Interfaces.RealOutput {{dict_item["name"]}} (unit="{{dict_item["unit"]}}")
    "{{dict_item["description"]}}"{{dict_item["annotation"]}};
  {%- endif -%}
  {% endfor %}
  
  parameter Real _saveToFile = 0 "Flag for writing results"; 
  parameter String _configurationFileName="" "Configuration file name";
protected   
  parameter Integer nDblPar={{parameter_variable_names|length}} 
    "Number of double parameter values to sent to CYMDIST";
  parameter Integer nDblInp(min=1)={{input_variable_names|length}} 
    "Number of double input values to sent to CYMDIST";
  parameter Integer nDblOut(min=1)={{output_variable_names|length}}  
    "Number of double output values to receive from CYMDIST";
 
  Real resWri[1]= {_saveToFile} "Flag for writing results";
  Real dblInpVal[nDblInp] "Value to be sent to CYMDIST";
  
  {% if (input_variable_names|length==0) -%} 
  Real uR[nDblInp]
    "Variables used to collect values to be sent to CYMDIST";
  {%- else %}
  {% set comma = joiner(",") -%}  
  Real uR[nDblInp]={
  {%- for row in modelica_input_variable_names -%}
  {{comma()}}
  {{row}}
  {%- endfor %} 
  }"Variables used to collect values to be sent to CYMDIST";
  {%- endif %}
  {% if (output_variable_names|length==0) -%} 
  Real yR[nDblOut]
    "Variables used to collect values received from CYMDIST";
  {%- else %} 
  {% set comma = joiner(",") -%} 
  Real yR[nDblOut]={
  {%- for row in modelica_output_variable_names -%}
  {{comma()}}
  {{row}}
  {%- endfor %} 
  }"Variables used to collect values received from CYMDIST";
  {%- endif %}
  {% if (input_variable_names|length==0) -%} 
  parameter String dblInpNam[nDblInp]
    "Input variables names to be sent to CYMDIST";
  {%- else %}
  {% set comma = joiner(",") -%}   
  parameter String dblInpNam[nDblInp]={
  {%- for row in input_variable_names -%}
  {{comma()}}
  "{{row}}"
  {%- endfor %} 
  }"Input variables names to be sent to CYMDIST";
  {%- endif %}
  {% if (output_variable_names|length==0) -%} 
  parameter String dblOutNam[nDblOut]
    "Output variables names to be received from CYMDIST";
  {%- else %}
  {% set comma = joiner(",") -%} 
  parameter String dblOutNam[nDblOut]={
  {%- for row in output_variable_names -%}
  {{comma()}}
  "{{row}}"
  {%- endfor %} 
  }"Output variables names to be received from CYMDIST";
  {%- endif %}
  {% if (parameter_variable_names|length==0) -%} 
  parameter String dblParNam[nDblPar](each start="") 
    "Parameter variables names to be sent to CYMDIST";
  {%- else %}
  {% set comma = joiner(",") -%}
  parameter String dblParNam[nDblPar]={
  {%- for row in parameter_variable_names -%}
  {{comma()}}
  "{{row}}"
  {%- endfor %}
  }"Parameter variables names to be sent to CYMDIST";
  {%- endif %}
  {% if (parameter_variable_names|length==0) -%} 
  parameter Real dblParVal[nDblPar]=zeros(nDblPar)
    "Parameter variables values to be sent to CYMDIST";
  {%- else %}
  {% set comma = joiner(",") -%} 
  parameter Real dblParVal[nDblPar]={
  {%- for row in parameter_variable_values -%}
  {{comma()}}
  {{row}}
  {%- endfor %}
  }"Parameter variables values to be sent to CYMDIST";
  {%- endif %}
  
///////////// THE CODE ABOVE HAS BEEN AUTOGENERATED //////////////  
  
  parameter String moduleName="fmu"
    "Name of the python module that contains the function";
  parameter String functionName="cymdist" 
    "Name of the python function";
  
initial equation 
  assert(_configurationFileName <> "",
    "Parameter _configurationFileName: " +
     _configurationFileName + " must be set to " +
     "the path to the JSON configuration file. " +
     "This must be done prior to entering the " +
     "initialization mode of the FMU.");
equation 
  // Compute values that will be sent to CYMDIST
  for i in 1:nDblInp loop
	dblInpVal[i] = uR[i];
  end for;
  
  // Exchange data
  yR = CYMDISTToFMU.Python34.Functions.cymdist(
	  moduleName=moduleName,
	  functionName=functionName,
	  conFilNam=_configurationFileName,
	  modTim={time},
	  nDblInp=nDblInp,
	  dblInpNam=dblInpNam,
	  dblInpVal=dblInpVal,
	  nDblOut=nDblOut,
	  dblOutNam=dblOutNam,
	  nDblPar=nDblPar,
	  dblParNam=dblParNam,
	  dblParVal=dblParVal,
	  resWri=resWri);    
end {{model_name}};