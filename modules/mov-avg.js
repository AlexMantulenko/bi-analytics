const isNumber = n => typeof n === 'number' && isFinite(n);

const result = {
    moving_avg: (data, size) => {
        if (!size) 
            return data.reduce((total, item) => total + item) / data.length;
        if (size <= 1) 
            return data.slice();
        if (size > data.length) 
            return Array(data.length);
    
        let sum = 0, i = 0, count = 0, result = [];
    
        for (; i < data.length && count < size - 1; i++) {
            if (isNumber(data[i])) {
                sum += data[i];
                count++;
            }
        }
        for (; i < data.length; i++) {
            if (isNumber(data[i])) 
                sum += data[i];
            if (isNumber(data[i - size]))
                sum -= data[i - size];
            result[i] = sum / size;
        }
      
        return result;
    },
    
    weighted_moving_avg: (data, size) => {
        if (size <= 1) 
            return data.slice();
        if (size > data.length) 
            return Array(data.length);
      
        const result = [], denominator = size * (size + 1) / 2;
        let sum = 0, numerator = 0, i = 0, real = -1;
      
        for (; i < size - 1; i++) {
            if (isNumber(data[i])) {
                sum += data[i];
                numerator += (i + 1) * data[i];
            }
        }
        for (; i < data.length; i++, real++) {
            if (isNumber(data[i])) {
                sum += data[i];
                numerator += size * data[i];
            }
            if (real >= 0 && isNumber(data[real])) 
                sum -= data[real];
      
            result[i] = numerator / denominator;
            numerator -= sum;
        }
      
        return result;
    },
    
    dynamic_weighted_moving_avg: (data, alpha, noHead) => {
        if (alpha > 1) 
            return Array(data.length);
        if (alpha === 1) 
            return data.slice();
      
        let i = 0, s = 0, noArrayWeight = !Array.isArray(alpha), ret = [], o = 1 - alpha;
      
        for (; i < data.length; i++) {
            if (isNumber(data[i]) && (noArrayWeight || isNumber(data[i]))) {
                ret[i] = noHead ? 0 : data[i];
                s = data[i];
                i++;
                break;
            }
        }
      
        if (!noArrayWeight) {
            for (; i < data.length; i++) {
                isNumber(data[i]) && isNumber(alpha[i]) ? s = ret[i] = alpha[i] * data[i] + (1 - alpha[i]) * s : ret[i] = ret[i - 1];
            }
            return ret;
        }
      
        for (; i < data.length; i++) {
            isNumber(data[i]) ? s = ret[i] = alpha * data[i] + o * s : ret[i] = ret[i - 1];
        }
      
        return ret;
    },
    
    exponential_moving_avg: (data, size) => result.dynamic_weighted_moving_avg(data, 2 / (size + 1)),
    
    smoothed_moving_avg: (data, size, times = 1) => result.dynamic_weighted_moving_avg(data, times / size, 1)
}

module.exports = result;