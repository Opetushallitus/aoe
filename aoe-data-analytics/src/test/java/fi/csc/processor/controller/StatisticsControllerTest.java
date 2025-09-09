package fi.csc.processor.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.csc.processor.model.request.EducationalLevelTotalRequest;
import fi.csc.processor.model.statistics.StatisticsMeta;
import fi.csc.processor.service.StatisticsService;
import fi.csc.processor.service.TimeSeriesService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StatisticsController.class)
@WebAppConfiguration
class StatisticsControllerTest {
    private MockMvc mockMvc;
    private final ObjectMapper objectMapper;
    private final WebApplicationContext webApplicationContext;

    @Autowired
    public StatisticsControllerTest(
        MockMvc mockMvc,
        ObjectMapper objectMapper,
        WebApplicationContext webApplicationContext) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
        this.webApplicationContext = webApplicationContext;
    }

    @MockBean
    private StatisticsService statisticsService;

    @MockBean
    private TimeSeriesService timeSeriesService;

    @BeforeEach
    public void setUp() {
        this.mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            .build();
        Mockito.when(statisticsService.getEducationalLevelDistribution(
            any(EducationalLevelTotalRequest.class))).thenReturn(new StatisticsMeta<>());
    }

    @Test
    void getEducationalLevelDistribution() throws Exception {
        EducationalLevelTotalRequest educationalLevelTotalRequest = new EducationalLevelTotalRequest() {{
            setSince(null);
            setUntil(null);
            setEducationalLevels(new String[]{"lev1", "lev2", "lev3"});
        }};
        MvcResult mvcResult = mockMvc.perform(post("/statistics/prod/educationallevel/all")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(educationalLevelTotalRequest))
            )
            .andExpect(request().asyncStarted())
            .andDo(MockMvcResultHandlers.log())
            .andReturn();
        this.mockMvc.perform(asyncDispatch(mvcResult))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith("application/json"));
    }

//    @Test
    void getEducationalLevelExpired() {
    }

//    @Test
    void getEducationalSubjectDistribution() {
    }

//    @Test
    void getOrganizationDistribution() {
    }

//    @Test
    void getMaterialActivityTotalByInterval() {
    }

//    @Test
    void getSearchRequestsTotalByInterval() {
    }
}